export default interface OrganizationFeature {
    key: string;
    name: string;
    description: string;
    overview_description: string;
    labels: Array<string>;
    enabled?: boolean;
}
