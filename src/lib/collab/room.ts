/**
 * 共同編集の room（共有URL）とユーザー識別のユーティリティ。
 *
 * room ID は「リンクを知る人だけが入れる鍵」として使う推測困難な文字列。
 * URL の ?room=<id> に載せ、同じ ID を開いた人同士が同期される。
 * ユーザー識別（名前・色）はプレゼンス表示専用で、ログインとは無関係。
 */

/** room ID を載せる URL クエリのキー。 */
const ROOM_PARAM = "room";

/** 現在の URL から room ID を取得する。無ければ null（＝ローカル単独モード）。 */
export function getRoomIdFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const id = new URLSearchParams(window.location.search).get(ROOM_PARAM);
  return id && id.trim() !== "" ? id.trim() : null;
}

/** 推測困難な room ID を生成する（UUID からハイフンを除いた 32 桁）。 */
export function generateRoomId(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

/** 指定 room ID を載せた共有 URL を現在ページから組み立てる。 */
export function buildRoomUrl(roomId: string): string {
  const url = new URL(window.location.href);
  url.searchParams.set(ROOM_PARAM, roomId);
  return url.toString();
}

/**
 * 「新規作成した部屋に現在の図を引き継ぐ」ための目印（作成者タブのみ）。
 * sessionStorage に置くのでタブ限定・既存の共有相手には影響しない。
 */
const SEED_FLAG_KEY = "umlwriter.seedRoom";

/** これから作る部屋を「現在の図で初期化する対象」として印を付ける。 */
export function markSeedRoom(roomId: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SEED_FLAG_KEY, roomId);
}

/**
 * この room が自分の作成した「初期化対象」なら true を返し、印を消す（1 回限り）。
 * 既存の部屋に入っただけのときは false（共有データを優先するため初期化しない）。
 */
export function consumeSeedFlag(roomId: string): boolean {
  if (typeof window === "undefined") return false;
  if (sessionStorage.getItem(SEED_FLAG_KEY) !== roomId) return false;
  sessionStorage.removeItem(SEED_FLAG_KEY);
  return true;
}

/** プレゼンス表示に使うユーザー識別。共有ドキュメントには保存しない。 */
export interface UserIdentity {
  /** 表示名（例 "ゲスト・きつね"）。 */
  name: string;
  /** カーソル・選択枠の色（CSS カラー）。 */
  color: string;
}

/** 名前に使う動物（適当な識別で十分なので固定リストから選ぶ）。 */
const ANIMALS = [
  "きつね",
  "たぬき",
  "ふくろう",
  "うさぎ",
  "こあら",
  "ぱんだ",
  "りす",
  "はりねずみ",
  "あざらし",
  "ぺんぎん",
];

/** カーソル色のパレット（視認しやすい彩度高めの 8 色）。 */
const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

/** リストからランダムに 1 件選ぶ。 */
function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/** このタブ用のユーザー識別をランダム生成する。 */
export function createUserIdentity(): UserIdentity {
  return { name: `ゲスト・${pick(ANIMALS)}`, color: pick(COLORS) };
}
