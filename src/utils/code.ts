export function generateAgentCode(longitud = 4) {
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let codigo = "";
  for (let i = 0; i < longitud; i++) {
    const indice = Math.floor(Math.random() * letras.length);
    codigo += letras[indice];
  }
  return codigo.toUpperCase();
}
