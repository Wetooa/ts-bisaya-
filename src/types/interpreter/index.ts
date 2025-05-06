export interface ASTNode {
  value: any;
  left: ASTNode | null;
  right: ASTNode | null;
}

export interface AST {
  root: ASTNode | null;
}
