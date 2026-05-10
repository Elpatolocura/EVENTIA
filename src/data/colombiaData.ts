export interface ColombiaCity {
  name: string;
  department: string;
}

export const colombiaCities: ColombiaCity[] = [
  // Amazonas
  { name: "Leticia", department: "Amazonas" },
  { name: "Puerto Nariño", department: "Amazonas" },
  // Antioquia
  { name: "Medellín", department: "Antioquia" },
  { name: "Bello", department: "Antioquia" },
  { name: "Itagüí", department: "Antioquia" },
  { name: "Envigado", department: "Antioquia" },
  { name: "Apartadó", department: "Antioquia" },
  { name: "Rionegro", department: "Antioquia" },
  { name: "Sabaneta", department: "Antioquia" },
  { name: "Caucasia", department: "Antioquia" },
  { name: "Turbo", department: "Antioquia" },
  // Arauca
  { name: "Arauca", department: "Arauca" },
  { name: "Tame", department: "Arauca" },
  { name: "Saravena", department: "Arauca" },
  // Atlántico
  { name: "Barranquilla", department: "Atlántico" },
  { name: "Soledad", department: "Atlántico" },
  { name: "Malambo", department: "Atlántico" },
  { name: "Sabanalarga", department: "Atlántico" },
  // Bolívar
  { name: "Cartagena", department: "Bolívar" },
  { name: "Magangué", department: "Bolívar" },
  { name: "Turbaco", department: "Bolívar" },
  // Boyacá
  { name: "Tunja", department: "Boyacá" },
  { name: "Duitama", department: "Boyacá" },
  { name: "Sogamoso", department: "Boyacá" },
  { name: "Chiquinquirá", department: "Boyacá" },
  // Caldas
  { name: "Manizales", department: "Caldas" },
  { name: "La Dorada", department: "Caldas" },
  { name: "Chinchiná", department: "Caldas" },
  // Caquetá
  { name: "Florencia", department: "Caquetá" },
  { name: "San Vicente del Caguán", department: "Caquetá" },
  // Casanare
  { name: "Yopal", department: "Casanare" },
  { name: "Aguazul", department: "Casanare" },
  // Cauca
  { name: "Popayán", department: "Cauca" },
  { name: "Santander de Quilichao", department: "Cauca" },
  // Cesar
  { name: "Valledupar", department: "Cesar" },
  { name: "Aguachica", department: "Cesar" },
  // Chocó
  { name: "Quibdó", department: "Chocó" },
  { name: "Istmina", department: "Chocó" },
  // Córdoba
  { name: "Montería", department: "Córdoba" },
  { name: "Cereté", department: "Córdoba" },
  { name: "Lorica", department: "Córdoba" },
  { name: "Sahagún", department: "Córdoba" },
  // Cundinamarca
  { name: "Bogotá", department: "Cundinamarca" },
  { name: "Soacha", department: "Cundinamarca" },
  { name: "Girardot", department: "Cundinamarca" },
  { name: "Zipaquirá", department: "Cundinamarca" },
  { name: "Facatativá", department: "Cundinamarca" },
  { name: "Fusagasugá", department: "Cundinamarca" },
  { name: "Chía", department: "Cundinamarca" },
  { name: "Mosquera", department: "Cundinamarca" },
  { name: "Madrid", department: "Cundinamarca" },
  { name: "Funza", department: "Cundinamarca" },
  // Guainía
  { name: "Inírida", department: "Guainía" },
  // Guaviare
  { name: "San José del Guaviare", department: "Guaviare" },
  // Huila
  { name: "Neiva", department: "Huila" },
  { name: "Pitalito", department: "Huila" },
  { name: "Garzón", department: "Huila" },
  // La Guajira
  { name: "Riohacha", department: "La Guajira" },
  { name: "Maicao", department: "La Guajira" },
  { name: "Uribia", department: "La Guajira" },
  // Magdalena
  { name: "Santa Marta", department: "Magdalena" },
  { name: "Ciénaga", department: "Magdalena" },
  { name: "Fundación", department: "Magdalena" },
  // Meta
  { name: "Villavicencio", department: "Meta" },
  { name: "Acacías", department: "Meta" },
  { name: "Granada", department: "Meta" },
  // Nariño
  { name: "Pasto", department: "Nariño" },
  { name: "Tumaco", department: "Nariño" },
  { name: "Ipiales", department: "Nariño" },
  // Norte de Santander
  { name: "Cúcuta", department: "Norte de Santander" },
  { name: "Ocaña", department: "Norte de Santander" },
  { name: "Villa del Rosario", department: "Norte de Santander" },
  { name: "Pamplona", department: "Norte de Santander" },
  // Putumayo
  { name: "Mocoa", department: "Putumayo" },
  { name: "Puerto Asís", department: "Putumayo" },
  // Quindío
  { name: "Armenia", department: "Quindío" },
  { name: "Calarcá", department: "Quindío" },
  { name: "Quimbaya", department: "Quindío" },
  // Risaralda
  { name: "Pereira", department: "Risaralda" },
  { name: "Dosquebradas", department: "Risaralda" },
  { name: "Santa Rosa de Cabal", department: "Risaralda" },
  // San Andrés y Providencia
  { name: "San Andrés", department: "San Andrés y Providencia" },
  // Santander
  { name: "Bucaramanga", department: "Santander" },
  { name: "Floridablanca", department: "Santander" },
  { name: "Girón", department: "Santander" },
  { name: "Piedecuesta", department: "Santander" },
  { name: "Barrancabermeja", department: "Santander" },
  // Sucre
  { name: "Sincelejo", department: "Sucre" },
  { name: "Corozal", department: "Sucre" },
  // Tolima
  { name: "Ibagué", department: "Tolima" },
  { name: "Espinal", department: "Tolima" },
  { name: "Melgar", department: "Tolima" },
  // Valle del Cauca
  { name: "Cali", department: "Valle del Cauca" },
  { name: "Buenaventura", department: "Valle del Cauca" },
  { name: "Palmira", department: "Valle del Cauca" },
  { name: "Tuluá", department: "Valle del Cauca" },
  { name: "Cartago", department: "Valle del Cauca" },
  { name: "Jamundí", department: "Valle del Cauca" },
  { name: "Buga", department: "Valle del Cauca" },
  { name: "Yumbo", department: "Valle del Cauca" },
  // Vaupés
  { name: "Mitú", department: "Vaupés" },
  // Vichada
  { name: "Puerto Carreño", department: "Vichada" },
];
