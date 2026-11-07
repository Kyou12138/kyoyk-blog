/** 拆分一次 SQL 脚本里的多条语句（本项目不使用函数体，按分号切够用）。 */
export const splitStatements = (sql: string): string[] =>
  sql
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.replace(/^\s*(?:--[^\n]*\r?\n\s*)+/, "").trim())
    .filter((statement) => statement.length > 0 && !statement.startsWith("--"));
