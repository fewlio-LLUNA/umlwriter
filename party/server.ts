/**
 * 共同編集の同期サーバー（Cloudflare Durable Objects）。
 *
 * 1 つの room（＝共有URL の ID）ごとに Document インスタンスが 1 つ立ち、
 * そこに接続した全員の Yjs 変更をマージ・配信する。y-partyserver が
 * WebSocket・Yjs 同期・Awareness（プレゼンス）を担うので、ここでは
 * 「room を閉じてもデータを 10 日間だけ残す」永続化のみを差し込む。
 *
 * ルーティングは routePartykitRequest が担当。クラス名 "Document" は
 * kebab-case "document" に変換され、クライアントは party="document" で繋ぐ。
 */

import { routePartykitRequest } from "partyserver";
import { YServer } from "y-partyserver";
import * as Y from "yjs";

/** wrangler.jsonc のバインディングと対応させる環境。 */
interface Env {
  /** room ごとの Durable Object 名前空間。 */
  Document: DurableObjectNamespace;
  /** 図データの退避先 KV。expirationTtl で自動失効させる。 */
  DIAGRAMS: KVNamespace;
}

/**
 * データ保持期間（秒）＝ 10 日。
 * KV の expirationTtl は「最後に put してから」の経過で失効するため、
 * 実質「最終編集から 10 日で自動消滅」になる（編集が続く限り延命される）。
 */
const RETENTION_SECONDS = 60 * 60 * 24 * 10;

/**
 * 1 つの共有図（room）を表す Durable Object。
 * onLoad で KV から復元し、onSave で KV へ退避する。
 */
export class Document extends YServer {
  /** 保存頻度の調整。編集のたびに書かず、まとめて KV に反映する。 */
  static callbackOptions = {
    debounceWait: 2000, // 最後の編集から 2 秒静まったら保存
    debounceMaxWait: 10000, // 連続編集でも最大 10 秒で必ず保存
    timeout: 5000,
  };

  /** バインディングへ型付きでアクセスする（YServer では env の型が失われるため）。 */
  private get bindings(): Env {
    return this.env as unknown as Env;
  }

  /** クライアント接続時に一度だけ呼ばれる。KV に退避済みの図があれば復元する。 */
  async onLoad(): Promise<void> {
    const stored = await this.bindings.DIAGRAMS.get(this.name, "arrayBuffer");
    if (stored) {
      Y.applyUpdate(this.document, new Uint8Array(stored));
    }
  }

  /** 編集後に定期的に、また room が空になったときに呼ばれる。図を KV へ退避する。 */
  async onSave(): Promise<void> {
    const update = Y.encodeStateAsUpdate(this.document);
    await this.bindings.DIAGRAMS.put(this.name, update, {
      expirationTtl: RETENTION_SECONDS,
    });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // /parties/document/<roomId> を該当 Durable Object へ振り分ける。
    return (
      (await routePartykitRequest(request, env as unknown as Record<string, unknown>)) ||
      new Response("Not Found", { status: 404 })
    );
  },
} satisfies ExportedHandler<Env>;
