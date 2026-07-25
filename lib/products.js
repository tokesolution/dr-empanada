export const CATEGORIES = ['Combos', 'Clásicas', 'Especiales', 'Pastelitos y Postres', 'Bebidas']

export const PRODUCTS = [
  // ── Clásicas ── $3.800 c/u
  { id: 'carne-suave',    category: 'Clásicas', nombre: 'Carne Suave',       desc: 'Carne vacuna, bien condimentada y ese sabor clásico que no falla.',             price: 3800, img: '/images/menu/carne-suave.png' },
  { id: 'carne-cuchillo', category: 'Clásicas', nombre: 'Carne Cuchillo',    desc: 'Cuadril cortado a cuchillo, más jugoso y sabroso.',                             price: 3800, img: '/images/menu/carne-cuchillo.jpg' },
  { id: 'carne-picante',  category: 'Clásicas', nombre: 'Carne Picante',     desc: 'Carne de calidad con un picante que se siente.',                                price: 3800, img: '/images/menu/carne-picante.jpg' },
  { id: 'pollo',          category: 'Clásicas', nombre: 'Pollo',             desc: 'Pollo suave con ese gustito casero.',                                           price: 3800, img: '/images/menu/pollo.jpg' },
  { id: 'humita',         category: 'Clásicas', nombre: 'Humita',            desc: 'Deliciosa mezcla de choclo entero, choclo cremoso y el resto es secreto del doctor.', price: 3800, img: '/images/menu/humita.jpg' },
  { id: 'roque-jamon',    category: 'Clásicas', nombre: 'Roquefort y Jamón', desc: 'Jamón cocido feteado con intenso queso roquefort.',                             price: 3800, img: '/images/menu/roque-jamon.jpg' },
  { id: 'jamon-queso',    category: 'Clásicas', nombre: 'Jamón y Queso',     desc: 'Jamón cocido feteado con abundante muzzarella de primera calidad.',             price: 3800, emoji: '🧀' },
  { id: 'verdura',        category: 'Clásicas', nombre: 'Verdura',           desc: 'Salteado de espinaca, con nuez moscada, pimienta y el secreto del doctor.',    price: 3800, img: '/images/menu/verdura.jpg' },
  { id: 'queso-cebolla',  category: 'Clásicas', nombre: 'Queso y Cebolla',   desc: 'Combinación de muzzarella de primera calidad y salteado de cebolla.',          price: 3800, img: '/images/menu/queso-cebolla.jpg' },
  { id: 'caprese',        category: 'Clásicas', nombre: 'Caprese',           desc: 'Albahaca, muzzarela, aceitunas negras y tomate cherry.',                       price: 3800, img: '/images/menu/caprese.jpg' },

  // ── Especiales
  { id: 'cheeseburger',   category: 'Especiales', nombre: 'Cheeseburguer',     desc: 'Panceta con cheddar fundido, estilo burger en versión empanada.',                         price: 4000, img: '/images/menu/cheeseburger.jpg' },
  { id: 'provolone',      category: 'Especiales', nombre: 'Provolone',         desc: 'Combinación de muzzarella elaborada con queso provolone, pimienta y orégano.',           price: 4000, img: '/images/menu/provolone.jpg' },
  { id: 'bondiola-bbq',   category: 'Especiales', nombre: 'Bondiola BBQ',      desc: 'Bondiola cocida lentamente por 5 horas, desmenuzada, con salsa barbacoa.',              price: 4000, emoji: '🍖' },
  { id: 'vacio-provo',    category: 'Especiales', nombre: 'Vacío y Provoleta', desc: 'Vacío desmechado con provoleta fundida.',                                              price: 4500, img: '/images/menu/vacio.jpg' },
  { id: 'matambre-pizza', category: 'Especiales', nombre: 'Matambre',          desc: 'Matambre tierno, acompañado de muzzarella y salsa de la casa.',                        price: 4000, img: '/images/menu/matambre-pizza.jpg' },

  // ── Pastelitos y Postres ── $2.800 c/u
  { id: 'pastelito-ddl',       category: 'Pastelitos y Postres', nombre: 'Pastelito DDL',      desc: 'Pastelito de dulce de leche frito en grasa.',    price: 2800, img: '/images/menu/pastelito-ddl.jpg' },
  { id: 'pastelito-batata',    category: 'Pastelitos y Postres', nombre: 'Pastelito Batata',   desc: 'Pastelito de dulce de batata frito en grasa.',   price: 2800, img: '/images/menu/pastelito-batata.jpg' },
  { id: 'pastelito-membrillo', category: 'Pastelitos y Postres', nombre: 'Pastelito Membrillo',desc: 'Pastelito de dulce de membrillo frito en grasa.',price: 2800, img: '/images/menu/pastelito-membrillo.jpg' },
  { id: 'chocotorta',          category: 'Pastelitos y Postres', nombre: 'Chocotorta',         desc: 'Postre clásico argentino, cremoso e irresistible.',price: 2800, emoji: '🍫' },

  // ── Combos
  { id: 'combo-2emp-1past',  category: 'Combos', nombre: '2 Empanadas + 1 Pastelito',        desc: '2 empanadas clásicas a elección (fritas o al horno) + 1 pastelito a elección.',                          price: 9800,  emoji: '🤌' },
  { id: 'combo-3emp',        category: 'Combos', nombre: '3 Empanadas',                      desc: '3 empanadas clásicas a elección entre gustos clásicos, fritas o al horno.',                              price: 10500, emoji: '🫔' },
  { id: 'combo-6emp',        category: 'Combos', nombre: '6 Empanadas',                      desc: '6 empanadas clásicas a elección entre gustos clásicos, fritas o al horno.',                              price: 22500, emoji: '🫔' },
  { id: 'combo-6emp-2past',  category: 'Combos', nombre: '6 Empanadas + 2 Pastelitos',       desc: '6 empanadas clásicas a elección (fritas o al horno) + 2 pastelitos a elección.',                        price: 25500, emoji: '🎁' },
  { id: 'combo-12emp',       category: 'Combos', nombre: '12 Empanadas',                     desc: '12 empanadas clásicas a elección entre gustos clásicos, fritas o al horno.',                             price: 45600, emoji: '🫔' },
  { id: 'combo-12emp-3past', category: 'Combos', nombre: '12 Empanadas + 3 Pastelitos',      desc: '12 empanadas clásicas a elección (fritas o al horno) + 3 pastelitos a elección de regalo.',             price: 45600, emoji: '🎁' },
  { id: 'combo-12emp-regalo',category: 'Combos', nombre: '12 Empanadas + 2 de Regalo',       desc: '14 empanadas clásicas a elección (fritas o al horno) al precio de 12.',                                 price: 45600, emoji: '🎉' },
  { id: 'combo-18emp',       category: 'Combos', nombre: '18 Empanadas',                     desc: '18 empanadas clásicas a elección entre gustos clásicos, fritas o al horno.',                             price: 66000, emoji: '🫔' },
  { id: 'combo-24emp',       category: 'Combos', nombre: '24 Empanadas',                     desc: '24 empanadas clásicas a elección entre gustos clásicos, fritas o al horno.',                             price: 82500, emoji: '🫔' },
]

export function formatPrice(n) {
  return `$${n.toLocaleString('es-AR')}`
}
