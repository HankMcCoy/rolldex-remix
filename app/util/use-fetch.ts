import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export const useFetch = <T>(url: string | null) => useSWR<T>(url, fetcher);
