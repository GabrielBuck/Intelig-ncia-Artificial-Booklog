/*
 * Projeto N2 de Inteligência Artificial — BookLog (Mackenzie/FCI, 2026/2)
 * Integrantes: Gabriel Nottoli Buck (RA 10425384), Julia Andrade (RA 10427828),
 *              João Vitor Rocha Miranda (RA 10427273), Juan Nacif (RA 10428509)
 * Finalidade: configuração do Jest para executar, na cópia acadêmica, os testes
 *             unitários originais dos provedores de recomendação.
 * Histórico:
 * 18/11/2026 - Grupo - criação da configuração de testes da cópia acadêmica.
 */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: { strict: true, esModuleInterop: true, experimentalDecorators: true, emitDecoratorMetadata: true } }] },
  modulePathIgnorePatterns: ['<rootDir>/dist'],
};
