declare module "adf-to-md" {
    export function convert(adf: object): { result: string; warnings: Record<string, unknown> };
    export function validate(adf: object): boolean;
}
