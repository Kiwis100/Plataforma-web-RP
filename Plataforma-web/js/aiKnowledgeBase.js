/* ==========================================================================
   BASE DE CONOCIMIENTO SURCOIA — INFORMACIÓN REAL DE JUAN PALMA
   Fuente: Material oficial de campaña "¿Quién es Juan Palma?"
   ========================================================================== */

const predefinedKnowledge = [
  {
    keywords: ["quien es", "quién es", "biografia", "biografía", "quien eres juan", "sobre juan palma", "candidato"],
    topic: "¿Quién es Juan Palma?",
    response: `👋 <strong>¿Quién es Juan Palma?</strong><br/><br/>
Un vecino de Surco que decidió dar un paso al frente. Padre de familia, empresario, deportista y surcano de toda la vida.<br/><br/>
• Estudió en el colegio <strong>Alcides Vigo Hurtado</strong> de Santiago de Surco.<br/>
• Licenciado en <strong>Administración y Gerencia de Empresas</strong> por la Universidad Ricardo Palma.<br/>
• Maestría en <strong>Gestión Pública</strong> y diplomados en Administración de Gobiernos Locales y Regionales.<br/>
• Trabajó en las municipalidades de <strong>Cieneguilla</strong> y del <strong>Rímac</strong>.<br/>
• Actualmente cursa una segunda carrera profesional en <strong>Ingeniería Informática</strong>.<br/><br/>
<em>"A mis 40 años, estoy preparado para tomar las riendas de nuestro distrito y convertir a Surco en un referente de seguridad, orden y calidad de vida."</em><br/><br/>
Puedes conocer más en la sección <strong>"¿Quién es Juan Palma?"</strong> de esta página.`
  },
  {
    keywords: ["seguridad", "propone", "delincuencia", "serenazgo", "robos", "patrullaje"],
    topic: "Mejor Seguridad",
    response: `🛡️ <strong>Eje 1: Mejor Seguridad</strong><br/><br/>
Calles más seguras y tranquilas para nuestras familias. Este es el primer y más importante compromiso del plan de gobierno de Juan Palma para Santiago de Surco.<br/><br/>
Puedes ver los 6 ejes completos en la sección <strong>"Plan de Gobierno"</strong> de esta página.`
  },
  {
    keywords: ["parque", "abandonado", "denunciar", "denuncia", "basura", "desmonte", "sucio", "cesped", "limpieza", "arboles", "verde"],
    topic: "Recuperemos los Parques Más Bonitos del Perú",
    response: `🌳 <strong>Eje 2: Recuperemos los Parques Más Bonitos del Perú</strong><br/><br/>
Todo Surco merece parques bonitos e iluminados para las familias.<br/><br/>
¿Quieres reportar un parque o espacio descuidado? Ve a la sección <strong>"Mapa de Problemas de Surco"</strong> en esta misma página, selecciona tu sector y haz clic en <strong>"Reportar Problema"</strong>. También puedes escribirnos por WhatsApp al <strong>907 027 516</strong>.`
  },
  {
    keywords: ["pista", "vereda", "calle", "trafico", "tráfico", "transporte", "movilidad", "semaforo", "semáforo"],
    topic: "Mejores Pistas y Veredas",
    response: `🛣️ <strong>Eje 3: Mejores Pistas y Veredas</strong><br/><br/>
Calles en buen estado, limpias y señalizadas para todos los vecinos de Surco.`
  },
  {
    keywords: ["deporte", "niños", "jovenes", "jóvenes", "losa deportiva", "canchas"],
    topic: "Más Deporte para Niños y Jóvenes",
    response: `⚽ <strong>Eje 4: Más Deporte para Niños y Jóvenes</strong><br/><br/>
Oportunidades para crecer sanos y con valores, a través del deporte como herramienta de formación para la niñez y juventud surcana.`
  },
  {
    keywords: ["salud", "hospital", "ambulancia", "urgencias", "clinica", "clínica", "medico", "médico"],
    topic: "Salud de Calidad",
    response: `🏥 <strong>Eje 5: Salud de Calidad</strong><br/><br/>
Un sistema de salud con Urgencias 24H. Un Hospital de la Solidaridad y una flota de ambulancias cerca de los vecinos.`
  },
  {
    keywords: ["municipalidad", "transparencia", "gestion", "gestión", "escuchar", "vecino", "burocracia"],
    topic: "Una Municipalidad que Vuelva a Escuchar al Vecino",
    response: `🏛️ <strong>Eje 6: Una Municipalidad que Vuelva a Escuchar al Vecino</strong><br/><br/>
Cercana, transparente y al servicio de todos. Así será la gestión municipal de Juan Palma para Santiago de Surco.`
  },
  {
    keywords: ["voluntario", "voluntariado", "unirme", "apoyar", "inscribirme"],
    topic: "Inscripción de Voluntarios",
    response: `🙋‍♂️ <strong>¡Sumate a la Ola del Cambio con Juan Palma!</strong><br/><br/>
Buscamos vecinos comprometidos que deseen unirse como:<br/>
• Coordinador Vecinal de Manzana<br/>
• Brigadista Digital<br/>
• Fiscal de Mesa Electoral<br/>
• Promotor de Propuestas<br/><br/>
Haz clic en el botón <strong>"Voluntariado"</strong> en el menú superior para registrar tus datos. ¡Juntos transformaremos Surco!`
  },
  {
    keywords: ["plan", "gobierno", "descargar", "pdf", "ejes", "propuestas"],
    topic: "Plan de Gobierno",
    response: `📄 <strong>Plan de Gobierno "Mi Compromiso con Surco":</strong><br/><br/>
Nuestro plan se organiza en <strong>6 ejes</strong>: Mejor Seguridad, Recuperemos los Parques Más Bonitos del Perú, Mejores Pistas y Veredas, Más Deporte para Niños y Jóvenes, Salud de Calidad, y Una Municipalidad que Vuelva a Escuchar al Vecino.<br/><br/>
Puedes ver el documento completo en la sección <strong>"Plan de Gobierno"</strong> de esta plataforma web, o escaneando el código QR de nuestro volante oficial.`
  },
  {
    keywords: ["whatsapp", "contacto", "telefono", "teléfono", "numero", "número", "escribir"],
    topic: "Contacto",
    response: `📲 <strong>Contáctanos:</strong><br/><br/>
WhatsApp: <strong>907 027 516</strong><br/>
Redes sociales: <strong>Juan Palma Aurazo</strong> en Facebook, Instagram y TikTok.<br/><br/>
También puedes escribirnos desde el <strong>Formulario de Contacto Directo</strong> de esta página.`
  }
];

function getAIResponse(query) {
  const q = query.toLowerCase();
  for (const item of predefinedKnowledge) {
    if (item.keywords.some(kw => q.includes(kw))) {
      return item.response;
    }
  }
  return `¡Gracias por tu pregunta! Asistente Virtual 'SurcoIA':<br/><br/>
Sobre tu consulta acerca de "${query}", el plan de gobierno de <strong>Juan Palma</strong> está enfocado en responder directamente a las necesidades vecinales de Surco a través de nuestros 6 ejes de trabajo.<br/><br/>
Te invitamos a explorar las secciones de <strong>Quién Es Juan Palma</strong> y <strong>Plan de Gobierno</strong>, o escribirnos por WhatsApp al <strong>907 027 516</strong>.`;
}
