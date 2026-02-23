import { useState, useMemo } from "react";
import styles from "./DataTable.module.css";

const DataTable = ({ columns = [], data = [], loading = false, pageSize = 8 }) => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState("asc");

    // Filter
    const filtered = useMemo(() => {
        if (!search) return data;
        return data.filter((row) =>
            columns.some((col) =>
                String(row[col.accessor] ?? "").toLowerCase().includes(search.toLowerCase())
            )
        );
    }, [data, search, columns]);

    // Sort
    const sorted = useMemo(() => {
        if (!sortKey) return filtered;
        return [...filtered].sort((a, b) => {
            const aVal = a[sortKey] ?? "";
            const bVal = b[sortKey] ?? "";
            return sortDir === "asc"
                ? String(aVal).localeCompare(String(bVal))
                : String(bVal).localeCompare(String(aVal));
        });
    }, [filtered, sortKey, sortDir]);

    // Paginate
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
        setPage(1);
    };

    return (
        <div className={styles.wrapper}>
            {/* Search */}
            <div className={styles.topBar}>
                <input
                    className={styles.searchInput}
                    placeholder="🔍 Search..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
                <span className={styles.count}>{sorted.length} records</span>
            </div>

            {/* Table */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.accessor}
                                    className={`${styles.th} ${col.sortable !== false ? styles.sortable : ""}`}
                                    onClick={() => col.sortable !== false && handleSort(col.accessor)}
                                >
                                    {col.header}
                                    {sortKey === col.accessor && (
                                        <span className={styles.sortIcon}>{sortDir === "asc" ? " ↑" : " ↓"}</span>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: pageSize }).map((_, i) => (
                                <tr key={i}>
                                    {columns.map((col) => (
                                        <td key={col.accessor}><div className={styles.skeleton} /></td>
                                    ))}
                                </tr>
                            ))
                        ) : paginated.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className={styles.empty}>No records found</td>
                            </tr>
                        ) : (
                            paginated.map((row, i) => (
                                <tr key={i} className={styles.row}>
                                    {columns.map((col) => (
                                        <td key={col.accessor} className={styles.td}>
                                            {col.render ? col.render(row[col.accessor], row) : row[col.accessor]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className={styles.pagination}>
                <button
                    className={styles.pageBtn}
                    disabled={currentPage === 1}
                    onClick={() => setPage((p) => p - 1)}
                >← Prev</button>
                <span className={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
                <button
                    className={styles.pageBtn}
                    disabled={currentPage === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                >Next →</button>
            </div>
        </div>
    );
};

export default DataTable;
