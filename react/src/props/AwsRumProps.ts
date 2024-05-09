export default interface AwsRumProps {
    appId: string;
    appVersion: string;
    appRegion: string;
    allowCookies: boolean;
    enableXRay: boolean;
    endpoint: string;
    identityPoolId: string;
    sessionSampleRate: number;
    telemetries: Array<string>;
}
