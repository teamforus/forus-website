export default interface OfficeSchedule {
    id?: number;
    office_id?: number;
    week_day: number;
    start_time: string;
    end_time: string;
    break_start_time: string;
    break_end_time: string;
}
