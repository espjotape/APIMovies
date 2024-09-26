module.exports = {
  // Se um teste falhar o "bail" para de executar, isso pq está "true" se estivesse "false" ele continuaria. 
  bail: true,
  coverageProvider: "v8",

  testMatch: [
    // Partindo da raiz do projeto ("<rootDir>"), estou pedindo para ele pular a pasta "node_modules".
    // Ai ele entra na pasta "src" dentro de qualquer pasta, com qualquer arquivo desde que tenha ".spec.js" na extensão dele
    "<rootDir>/src/**/**.spec.js"
  ]
}