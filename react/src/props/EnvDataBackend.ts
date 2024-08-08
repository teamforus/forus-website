export default interface EnvDataBackend {
    client_key: string;
    client_type: string;
    client_key_api?: string;
    name: string;
    type: string;
    webRoot?: string;

    config: {
        api_url: string;
    };
}
