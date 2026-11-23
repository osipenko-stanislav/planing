import { useSearchParams } from "react-router-dom";
import type { ReactNode } from "react";

export function usePagination(total: number, name = "page") {
  const [params, setParams] = useSearchParams();
  const size = [5, 16, 32, 64].includes(Number(params.get(name + "Size"))) ? Number(params.get(name + "Size")) : 16;
  const pages = Math.max(1, Math.ceil(total / size));
  const requested = Number(params.get(name));
  const page = Number.isInteger(requested) && requested > 0 ? Math.min(requested, pages) : 1;
  const change = (next: number, nextSize = size) => {
    const query = new URLSearchParams(params);
    query.set(name, String(Math.min(Math.max(1, next), Math.max(1, Math.ceil(total / nextSize)))));
    query.set(name + "Size", String(nextSize));
    setParams(query, { replace: true });
  };
  return { total, size, page, pages, start: (page - 1) * size, change };
}
export function Pagination({ pagination: p, label }: { pagination: ReturnType<typeof usePagination>; label: string }) {
  const visible = Array.from({ length: p.pages }, (_, i) => i + 1).filter(n => p.pages <= 7 || n === 1 || n === p.pages || Math.abs(n - p.page) <= 1 || p.page <= 3 && n <= 4 || p.page >= p.pages - 2 && n >= p.pages - 3);
  return <div className="table-pagination"><nav aria-label={label}><button aria-label="Предыдущая страница" disabled={p.page === 1} onClick={() => p.change(p.page - 1)}><img src={import.meta.env.BASE_URL + "assets/pager-left.svg"} alt=""/></button>{visible.map((n, i) => <span className="pager-item" key={n}>{i > 0 && n - visible[i - 1] > 1 && <span className="pager-gap">…</span>}<button aria-label={"Страница " + n} aria-current={n === p.page ? "page" : undefined} onClick={() => p.change(n)}>{n}</button></span>)}<button aria-label="Следующая страница" disabled={p.page === p.pages} onClick={() => p.change(p.page + 1)}><img src={import.meta.env.BASE_URL + "assets/pager-right.svg"} alt=""/></button></nav><label className="pager-size">Строк на страницу <select aria-label={label + ": строк на страницу"} value={p.size} onChange={e => p.change(1, Number(e.target.value))}>{[5,16,32,64].map(size => <option key={size} value={size}>{size}</option>)}</select><span aria-live="polite">{p.total ? p.start + 1 : 0} – {Math.min(p.start + p.size, p.total)} из {p.total}</span></label></div>;
}
export function Paginated<T>({ items, name, label, children }: { items: T[]; name: string; label: string; children: (items: T[]) => ReactNode }) {
  const pagination = usePagination(items.length, name);
  return <>{children(items.slice(pagination.start, pagination.start + pagination.size))}<Pagination pagination={pagination} label={label}/></>;
}
