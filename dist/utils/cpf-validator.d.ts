export declare class CpfValidator {
    /**
     * Remove pontos, hífens e espaços do CPF
     */
    static clean(cpf: string): string;
    /**
     * Valida se o CPF é válido usando o algoritmo de verificação
     */
    static isValid(cpf: string): boolean;
    /**
     * Valida e limpa o CPF em uma operação
     */
    static validateAndClean(cpf: string): {
        isValid: boolean;
        cleanCpf: string;
    };
}
//# sourceMappingURL=cpf-validator.d.ts.map