/* ==========================================================================
   LOS PROBLEMAS DE SURCO Y LAS SOLUCIONES DE JUAN PALMA
   Fuente: Resumen ejecutivo del Plan de Gobierno (137 páginas) — 9 ejes
   estratégicos con problema, programa propuesto e implementación.
   ========================================================================== */

const surcoSectors = [
  { id: "seguridad", name: "Seguridad Ciudadana" },
  { id: "movilidad", name: "Movilidad Urbana" },
  { id: "ambiente", name: "Medio Ambiente" },
  { id: "limpieza", name: "Limpieza Pública" },
  { id: "salud", name: "Salud" },
  { id: "adulto-mayor", name: "Adulto Mayor" },
  { id: "emprendimiento", name: "Emprendimiento" },
  { id: "gobierno-digital", name: "Gobierno Digital" },
  { id: "transparencia", name: "Transparencia" }
];

let surcoIssues = [
  {
    id: "PLAN-01",
    sectorId: "seguridad",
    sectorName: "Seguridad Ciudadana",
    title: "Incremento de la inseguridad ciudadana",
    description: "Robos, hurtos, extorsión, delitos informáticos y violencia afectan la tranquilidad de los vecinos de Santiago de Surco.",
    programName: "Surco Seguro 360°",
    proposedSolution: "Fortalecer el serenazgo, la videovigilancia inteligente, la integración con la Policía Nacional, drones de patrullaje, inteligencia territorial y participación activa de las juntas vecinales.",
    implementation: [
      "Centro de Inteligencia de Seguridad",
      "Cámaras con analítica de video e IA",
      "Botón de pánico desde la App Surco",
      "Aplicación móvil para vecinos",
      "Patrullaje inteligente",
      "Dashboard de monitoreo en tiempo real",
      "Alertas automáticas para Serenazgo"
    ],
    isOfficial: true,
  },
  {
    id: "PLAN-02",
    sectorId: "movilidad",
    sectorName: "Movilidad Urbana",
    title: "Congestión vehicular",
    description: "El crecimiento del parque automotor genera tráfico, contaminación y pérdida de tiempo para los vecinos de Surco.",
    programName: "Acceso Sur Seguro y Fluido 2030",
    proposedSolution: "Semaforización inteligente, monitoreo en tiempo real y coordinación metropolitana para mejorar la movilidad urbana del distrito.",
    implementation: [
      "Semáforos inteligentes",
      "Sensores de tránsito",
      "IA para optimizar los tiempos semafóricos",
      "Información en tiempo real",
      "Aplicación de rutas alternas",
      "Dashboard de movilidad"
    ],
    isOfficial: true,
  },
  {
    id: "PLAN-03",
    sectorId: "ambiente",
    sectorName: "Medio Ambiente",
    title: "Contaminación ambiental y deterioro de parques",
    description: "El distrito enfrenta contaminación sonora, residuos sólidos, alto consumo de agua para riego y deterioro de áreas verdes.",
    programName: "Surco Verde Inteligente",
    proposedSolution: "Promover corredores verdes, riego tecnificado, sensores ambientales y economía circular para recuperar los espacios verdes de Surco.",
    implementation: [
      "Sensores de calidad del aire",
      "Riego inteligente",
      "Monitoreo ambiental",
      "App para reportar parques",
      "Dashboard ambiental",
      "Alertas por contaminación"
    ],
    isOfficial: true,
  },
  {
    id: "PLAN-04",
    sectorId: "limpieza",
    sectorName: "Limpieza Pública",
    title: "Acumulación de residuos sólidos",
    description: "Existen contenedores desbordados, falta de limpieza y mala disposición de residuos en distintos puntos del distrito.",
    programName: "Modernización de la Limpieza Pública",
    proposedSolution: "Modernizar el sistema de limpieza pública mediante monitoreo en tiempo real y optimización de rutas de recolección.",
    implementation: [
      "GPS en camiones recolectores",
      "IA para optimizar rutas",
      "Reporte ciudadano desde la App",
      "Evidencia fotográfica",
      "Dashboard de limpieza"
    ],
    isOfficial: true,
  },
  {
    id: "PLAN-05",
    sectorId: "salud",
    sectorName: "Salud",
    title: "Acceso limitado a servicios de salud preventiva",
    description: "Los vecinos de Surco enfrentan largas esperas y poca atención preventiva en los servicios de salud.",
    programName: "Médico Virtual Surcano",
    proposedSolution: "Brindar teleconsulta, teleorientación y seguimiento preventivo para acercar la atención de salud a los vecinos.",
    implementation: [
      "Citas en línea",
      "Chatbot médico",
      "Teleconsulta",
      "Recordatorios automáticos",
      "Historial digital"
    ],
    isOfficial: true,
  },
  {
    id: "PLAN-06",
    sectorId: "adulto-mayor",
    sectorName: "Adulto Mayor",
    title: "Incremento de la población adulta mayor",
    description: "Santiago de Surco tiene una población adulta mayor creciente que requiere atención, inclusión y acompañamiento activo.",
    programName: "Surco Adulto Mayor Activo",
    proposedSolution: "Promover el envejecimiento saludable, la teleasistencia y la inclusión digital de los adultos mayores del distrito.",
    implementation: [
      "Botón de emergencia",
      "Videollamadas",
      "Agenda médica",
      "Recordatorios",
      "Teleasistencia"
    ],
    isOfficial: true,
  },
  {
    id: "PLAN-07",
    sectorId: "emprendimiento",
    sectorName: "Emprendimiento",
    title: "Falta de herramientas para emprendedores",
    description: "Los emprendedores y pequeños negocios de Surco carecen de herramientas digitales para crecer y formalizarse.",
    programName: "Surco Emprende Digital",
    proposedSolution: "Impulsar la capacitación, la formalización y un marketplace distrital para emprendedores surcanos.",
    implementation: [
      "Plataforma Marketplace",
      "Capacitación virtual",
      "CRM empresarial",
      "Bolsa de empleo",
      "Ventanilla única"
    ],
    isOfficial: true,
  },
  {
    id: "PLAN-08",
    sectorId: "gobierno-digital",
    sectorName: "Gobierno Digital",
    title: "Procesos lentos y poca digitalización",
    description: "Los trámites municipales son lentos y la digitalización de procesos aún es limitada en el distrito.",
    programName: "Gobierno Inteligente",
    proposedSolution: "Modernizar la Municipalidad mediante un modelo de Gobierno Inteligente que agilice los trámites vecinales.",
    implementation: [
      "Expediente digital",
      "Firma electrónica",
      "Portal ciudadano",
      "IA para atención",
      "Mesa de partes virtual",
      "Trámites en línea"
    ],
    isOfficial: true,
  },
  {
    id: "PLAN-09",
    sectorId: "transparencia",
    sectorName: "Transparencia",
    title: "Falta de información sobre obras y presupuesto",
    description: "Los vecinos de Surco no cuentan con información clara y oportuna sobre las obras y el presupuesto municipal.",
    programName: "Gobierno Abierto Surcano",
    proposedSolution: "Garantizar transparencia y rendición de cuentas permanente sobre las obras y el presupuesto del distrito.",
    implementation: [
      "Portal de obras",
      "Datos abiertos",
      "Dashboard ciudadano",
      "Presupuesto en tiempo real",
      "Seguimiento de proyectos"
    ],
    isOfficial: true,
  }
];
