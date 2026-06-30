/**
 * UML クラス図のデータモデル。
 *
 * `uml-class-diagram-tool/data-model/` のスキーマ定義を TypeScript に写したもの。
 * Phase 0 では「型を置くだけ」で、まだ画面描画には使っていない。
 *
 * 永続データ（この型）と React Flow の `nodes` / `edges` は別概念で、
 * 双方向に変換して扱う想定。ID はすべてアプリ内で一意（例: `crypto.randomUUID()`）。
 */

/** 可視性（4 択）。+ public / - private / # protected / ~ package */
export type Visibility = "+" | "-" | "#" | "~";

/** ステレオタイプ。クラス名の上に «interface» のように表示する。 */
export type Stereotype = "none" | "abstract" | "interface" | "enumeration";

/** 関連線の種類（6 種）。source → target の向きで意味を固定する。 */
export type RelationKind =
  | "association" // 関連
  | "aggregation" // 集約
  | "composition" // コンポジション
  | "generalization" // 汎化（継承）
  | "realization" // 実現
  | "dependency"; // 依存

/** 属性（フィールド）1 件。 */
export interface Attribute {
  id: string;
  visibility: Visibility;
  /** 属性名 */
  name: string;
  /** 型（任意。"String" 等の自由入力） */
  type?: string;
  /** static なら下線表示 */
  isStatic?: boolean;
  /** 任意の説明 */
  description?: string;
}

/** 操作（メソッド）の引数 1 件。 */
export interface Parameter {
  name: string;
  type?: string;
}

/** 操作（メソッド）1 件。 */
export interface Operation {
  id: string;
  visibility: Visibility;
  /** 操作名 */
  name: string;
  /** 引数（順序保持） */
  parameters: Parameter[];
  /** 戻り型（任意） */
  returnType?: string;
  /** static なら下線 */
  isStatic?: boolean;
  /** abstract なら斜体 */
  isAbstract?: boolean;
  /** 任意の説明 */
  description?: string;
}

/** クラス・インターフェース・列挙を表すノード（箱）。 */
export interface ClassNode {
  id: string;
  /** クラス名 */
  name: string;
  stereotype: Stereotype;
  /** 任意の説明（例: "本クラス"） */
  description?: string;
  /** 属性の配列（順序保持） */
  attributes: Attribute[];
  /** 操作の配列（順序保持） */
  operations: Operation[];
  /** キャンバス上の座標 */
  position: { x: number; y: number };
}

/** 2 つのクラスを結ぶ関連線。 */
export interface Edge {
  id: string;
  /** 始点 ClassNode.id */
  source: string;
  /** 終点 ClassNode.id */
  target: string;
  kind: RelationKind;
  /** 関連名（任意） */
  label?: string;
  /** 始点側の多重度 例 "1" "*" "0..1" "1..*" */
  sourceMultiplicity?: string;
  /** 終点側の多重度 */
  targetMultiplicity?: string;
  /** 始点側のロール名 */
  sourceRole?: string;
  /** 終点側のロール名 */
  targetRole?: string;
  /**
   * 描画アンカー（任意）: 線がどの辺の Handle に接続しているか。
   * 元スキーマには無いがリロード時に接続辺を保つための加算的フィールド。
   * "top" | "right" | "bottom" | "left"。
   */
  sourceHandle?: string;
  targetHandle?: string;
}

/** ノート（コメント）の箱。MVP では空配列のまま。 */
export interface NoteNode {
  id: string;
  text: string;
  position: { x: number; y: number };
  /** 紐付け先 ClassNode.id / Edge.id（破線で結ぶ） */
  attachedTo?: string[];
}

/**
 * 図全体を表す最上位オブジェクト。JSON 入出力の単位。
 */
export interface Diagram {
  /** 例 "1.0"。後方互換の判定に使う */
  schemaVersion: string;
  /** クラスの箱の配列 */
  classes: ClassNode[];
  /** 関連線の配列 */
  edges: Edge[];
  /** ノート（コメント）の配列。MVP では空配列でも可 */
  notes: NoteNode[];
}
