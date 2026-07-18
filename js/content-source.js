/*
  Fuente de contenido dinámico de Indira Terapias.
  Cuando se conecte una fuente externa, este archivo puede reemplazar el
  arreglo local sin modificar el HTML ni el diseño de las páginas.
*/
(() => {
  const grids = document.querySelectorAll('.dynamic-grid[data-content-type]');
  grids.forEach((grid) => {
    if (!grid.children.length) {
      const section = grid.closest('.page-section');
      if (section && section.querySelectorAll('.dynamic-grid').length === 1) {
        section.hidden = true;
      }
    }
  });
})();
