export class CpfValidator {
  /**
   * Remove pontos, hífens e espaços do CPF
   */
  public static clean(cpf: string): string {
    return cpf.replace(/\D/g, '');
  }

  /**
   * Valida se o CPF é válido usando o algoritmo de verificação
   */
  public static isValid(cpf: string): boolean {
    const cleanCpf = this.clean(cpf);

    // Verificar se tem 11 dígitos
    if (cleanCpf.length !== 11) {
      return false;
    }

    // Verificar se não são todos os dígitos iguais
    if (/^(\d)\1{10}$/.test(cleanCpf)) {
      return false;
    }

    // Validar primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(cleanCpf.charAt(9))) {
      return false;
    }

    // Validar segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(cleanCpf.charAt(10))) {
      return false;
    }

    return true;
  }

  /**
   * Valida e limpa o CPF em uma operação
   */
  public static validateAndClean(cpf: string): {
    isValid: boolean;
    cleanCpf: string;
  } {
    const cleanCpf = this.clean(cpf);
    const isValid = this.isValid(cleanCpf);

    return { isValid, cleanCpf };
  }
}
