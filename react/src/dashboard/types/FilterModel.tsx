export default interface FilterModel {
    q?: string;
    per_page?: number;
    page?: number;
    order_by?: string;
    order_dir?: string;
    [key: string]: number | string | boolean | Array<number | string | boolean>;
}
