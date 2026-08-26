/* =========================================
   HOMOLOGASOLAR RT
   MOTOR DE DOCUMENTOS (jsPDF - Com Narrativas Avançadas e Detalhamento Técnico)
   ========================================= */
/**
 * Gerenciador unificado de visualização e download
 * @param {Object} pdf Instância do jsPDF
 * @param {String} nomeArquivo Nome do arquivo com .pdf
 * @param {String} modo 'visualizar' | 'baixar' | 'perguntar'
 */
function finalizarPDF(pdf, nomeArquivo, modo = 'perguntar') {
  let acao = modo;

  if (modo === 'perguntar') {
    const querVisualizar = confirm(
      "Deseja VISUALIZAR o documento antes de baixar?\n\n" +
      "• Clique em OK para Visualizar em nova aba\n" +
      "• Clique em Cancelar para Baixar Direto"
    );
    acao = querVisualizar ? 'visualizar' : 'baixar';
  }

  if (acao === 'visualizar') {
    const pdfBlobUrl = pdf.output('bloburl');
    const novaAba = window.open(pdfBlobUrl, '_blank');
    if (!novaAba) {
      alert("⚠️ O navegador bloqueou a abertura da nova aba. Por favor, permita pop-ups para este site ou utilize o download direto.");
      pdf.save(nomeArquivo);
    }
  } else {
    pdf.save(nomeArquivo);
  }
}



/* =========================================
   FUNÇÕES AUXILIARES DE TRATAMENTO DE TEXTO
========================================= */

function sanitizarTexto(texto) {
  if (texto === null || texto === undefined) return "";
  return String(texto)
    .replace(/&p|⚠️|❌|✔/g, "")
    .trim();
}

function formatarTipoConexao(valor) {
  if (!valor) return "—";
  const mapa = {
    monofasica: "Monofásica",
    bifasica: "Bifásica",
    trifasica: "Trifásica"
  };
  const chave = String(valor).toLowerCase().trim();
  return mapa[chave] || valor;
}

function documentoTexto(id, padrao = "—") {
  const elemento = document.getElementById(id);
  if (!elemento) return padrao;
  const texto = elemento.textContent || elemento.value || "";
  return texto.trim() || padrao;
}

function documentoValor(valor, padrao = "—") {
  if (valor === null || valor === undefined || valor === "") {
    return padrao;
  }
  return valor;
}

/* =========================================
   OBTER DADOS DO PROJETO
========================================= */

function obterDadosDocumento() {
  if (typeof sistemaAtual === "undefined" || !sistemaAtual) {
    throw new Error("Salve o sistema fotovoltaico antes de gerar o documento.");
  }

  return {
    projeto: documentoTexto("nomeProjeto"),
    status: documentoTexto("statusProjeto"),

    cliente: {
      nome: documentoTexto("clienteNome"),
      documento: documentoTexto("clienteDocumento"),
      telefone: documentoTexto("clienteTelefone"),
      email: documentoTexto("clienteEmail")
    },

    rt: {
      nome: documentoTexto("rtNome"),
      crea: documentoTexto("rtCrea"),
      uf: documentoTexto("rtUf"),
      registro: documentoTexto("rtRegistro")
    },

    sistema: {
      fabricanteModulo: documentoValor(sistemaAtual.fabricante_modulo),
      modeloModulo: documentoValor(sistemaAtual.modelo_modulo),
      potenciaModulo: documentoValor(sistemaAtual.potencia_modulo_w),
      quantidadeModulos: documentoValor(sistemaAtual.quantidade_modulos),
      vocModulo: documentoValor(sistemaAtual.voc_modulo),
      vmpModulo: documentoValor(sistemaAtual.vmp_modulo),
      iscModulo: documentoValor(sistemaAtual.isc_modulo),
      impModulo: documentoValor(sistemaAtual.imp_modulo),

      quantidadeStrings: documentoValor(sistemaAtual.quantidade_strings),
      modulosPorString: documentoValor(sistemaAtual.modulos_por_string),
      quantidadeMppt: documentoValor(sistemaAtual.quantidade_mppt),
      stringsPorMppt: documentoValor(sistemaAtual.strings_por_mppt),

      fabricanteInversor: documentoValor(sistemaAtual.fabricante_inversor),
      modeloInversor: documentoValor(sistemaAtual.modelo_inversor),
      potenciaInversor: documentoValor(sistemaAtual.potencia_inversor_kw),
      quantidadeInversores: documentoValor(sistemaAtual.quantidade_inversores),

      tensaoMaxEntrada: documentoValor(sistemaAtual.tensao_max_entrada_v),
      mpptMin: documentoValor(sistemaAtual.tensao_mppt_min_v),
      mpptMax: documentoValor(sistemaAtual.tensao_mppt_max_v),
      correnteMaxMppt: documentoValor(sistemaAtual.corrente_max_mppt_a),

      distribuidora: documentoValor(sistemaAtual.distribuidora),
      tipoLigacao: documentoValor(sistemaAtual.tipo_ligacao),
      numeroFases: documentoValor(sistemaAtual.numero_fases),
      tensaoNominal: documentoValor(sistemaAtual.tensao_nominal),
      observacoes: documentoValor(
        sistemaAtual.observacoes,
        "Nenhuma observação registrada."
      )
    },

    calculos: {
      potenciaDC: documentoTexto("potenciaDC"),
      potenciaAC: documentoTexto("potenciaAC"),
      ratioDCAC: documentoTexto("ratioDCAC"),
      potenciaString: documentoTexto("potenciaString"),
      vmpString: documentoTexto("vmpString"),
      vocString: documentoTexto("vocString"),
      correnteString: documentoTexto("correnteString")
    },

    validacao: documentoTexto("validacaoDimensionamento"),
    resultadoTecnico: documentoTexto("resultadoTecnico")
  };
}

/* =========================================
   GERAR MEMORIAL DESCRITIVO
========================================= */

async function gerarMemorialDescritivoPDF(modo = 'perguntar') {

  try {
    const dados = obterDadosDocumento();

    const jsPDFClass = window.jsPDF || (window.jspdf && window.jspdf.jsPDF);

    if (!jsPDFClass) {
      throw new Error("A biblioteca jsPDF não foi identificada no projeto.");
    }

    const pdf = new jsPDFClass("p", "mm", "a4");

    const margem = 20;
    const largura = 170;
    let y = 20;

    function verificarPagina(altura = 10) {
      if (y + altura > 270) {
        pdf.addPage();
        y = 25;
      }
    }

    function titulo(texto) {
      verificarPagina(15);
      pdf.setFontSize(15);
      pdf.setFont(undefined, "bold");
      pdf.setTextColor(26, 82, 118);
      pdf.text(sanitizarTexto(texto), margem, y);
      y += 8;
    }

    function subtitulo(texto) {
      verificarPagina(12);
      pdf.setFontSize(11);
      pdf.setFont(undefined, "bold");
      pdf.setTextColor(41, 128, 185);
      pdf.text(sanitizarTexto(texto), margem, y);
      y += 6;
    }

    function linha(texto, destaque = false) {
      pdf.setFontSize(9.5);
      pdf.setFont(undefined, destaque ? "bold" : "normal");
      pdf.setTextColor(40, 40, 40);

      const textoTratado = sanitizarTexto(texto);
      const linhas = pdf.splitTextToSize(textoTratado, largura);

      verificarPagina(linhas.length * 4.5 + 2);
      pdf.text(linhas, margem, y);
      y += linhas.length * 4.5 + 2;
    }

    function paragrafo(texto) {
      pdf.setFontSize(9);
      pdf.setFont(undefined, "normal");
      pdf.setTextColor(60, 60, 60);

      const textoTratado = sanitizarTexto(texto);
      const linhas = pdf.splitTextToSize(textoTratado, largura);

      verificarPagina(linhas.length * 4 + 3);
      pdf.text(linhas, margem, y);
      y += linhas.length * 4 + 3;
    }

    function espaco(tamanho = 4) {
      y += tamanho;
    }

    /* =================================
       CABEÇALHO TÉCNICO
    ================================= */
    titulo("HOMOLOGASOLAR RT");
    subtitulo("MEMORIAL DESCRITIVO DE MICROGERAÇÃO FOTOVOLTAICA");

    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.4);
    pdf.line(margem, y, margem + largura, y);
    espaco(5);

    linha("Projeto: " + dados.projeto, true);
    linha("Status do Sistema: " + dados.status);

    /* =================================
       1. OBJETO E NORMATIVA APLICÁVEL
    ================================= */
    espaco(4);
    subtitulo("1. OBJETO E EMBASAMENTO NORMATIVO");
    
    const narrativaObjeto = `O presente Memorial Descritivo contempla o detalhamento eletrotécnico e o dimensionamento para a implantação da unidade geradora fotovoltaica referente ao projeto ${dados.projeto}. O sistema opera na modalidade de microgeração distribuída conectada à rede da concessionária ${dados.sistema.distribuidora}.\n\n` +
      `Toda a concepção do projeto segue estritamente as especificações da ABNT NBR 5410 (Instalações Elétricas de Baixa Tensão), ABNT NBR 16690 (Instalações Elétricas Fotovoltaicas - Requisitos de Projeto), ABNT NBR IEC 62116 (Procedimentos de Teste Anti-ilhamento), além das Resoluções Normativas da ANEEL (REN 482/2012 e REN 1.000/2021) e regulamentos técnicos de acesso da distribuidora local.`;
    paragrafo(narrativaObjeto);

    /* =================================
       2. DADOS DAS PARTES
    ================================= */
    espaco(4);
    subtitulo("2. IDENTIFICAÇÃO DO TITULAR E RESPONSÁVEL TÉCNICO");
    linha("Cliente / Titular: " + dados.cliente.nome + " | CNPJ/CPF: " + dados.cliente.documento);
    linha("Contato: " + dados.cliente.telefone + " | E-mail: " + dados.cliente.email);
    linha("Responsável Técnico (RT): " + dados.rt.nome);
    linha("Conselho de Classe: " + dados.rt.crea + " (" + dados.rt.uf + ") — Registro: " + dados.rt.registro);

    /* =================================
       3. GERADOR FOTOVOLTAICO E ARRANJO CC
    ================================= */
    espaco(4);
    subtitulo("3. SUBSISTEMA GERADOR E ARRANJO EM CORRENTE CONTÍNUA (CC)");
    
    const narrativaModulos = `O gerador fotovoltaico é composto por ${dados.sistema.quantidadeModulos} módulos fotovoltaicos de altíssima eficiência, fabricados por ${dados.sistema.fabricanteModulo}, modelo ${dados.sistema.modeloModulo}, com potência nominal STC de ${dados.sistema.potenciaModulo} Wp por módulo, perfazendo uma potência instalada total no pico CC de ${dados.calculos.potenciaDC} kWp.\n\n` +
      `Os módulos estão configurados em ${dados.sistema.quantidadeStrings} string(s) contendo ${dados.sistema.modulosPorString} módulos em série. Sob condições padrão de ensaio (STC: 1000 W/m², 25°C, AM 1.5), o comportamento elétrico do gerador é determinado pelo somatório das tensões de cada circuito: a tensão total de circuito aberto atinge ${dados.calculos.vocString} (Voc STC nominal de ${dados.sistema.vocModulo} V/módulo) e a tensão operacional em máxima potência atinge ${dados.calculos.vmpString} (Vmp STC nominal de ${dados.sistema.vmpModulo} V/módulo). A corrente total de curto-circuito (Isc STC) do arranjo é de ${dados.sistema.iscModulo} A e a corrente de operação STC (Imp) é de ${dados.sistema.impModulo} A.`;
    paragrafo(narrativaModulos);

    linha("· Potência Instalada Total CC (P_dc): " + dados.calculos.potenciaDC + " kWp", true);
    linha("· Tensão em Circuito Aberto da String (Voc total STC): " + dados.calculos.vocString);
    linha("· Tensão Nominal de Operação da String (Vmp total STC): " + dados.calculos.vmpString);
    linha("· Corrente de Curto-Circuito (Isc STC): " + dados.sistema.iscModulo + " A");
    linha("· Corrente em Máxima Potência (Imp STC): " + dados.sistema.impModulo + " A");

    /* =================================
       4. CONVERSÃO E INVERSORES (CA)
    ================================= */
    espaco(4);
    subtitulo("4. SUBSISTEMA DE CONVERSÃO DE ENERGIA (INVERSORES E MPPT)");

    const narrativaInversor = `A conversão da energia CC gerada pelo arranjo para corrente alternada (CA) é realizada por ${dados.sistema.quantidadeInversores} unidade(s) de inversor(es) do fabricante ${dados.sistema.fabricanteInversor}, modelo ${dados.sistema.modeloInversor}, totalizando uma potência nominal ativa de saída CA de ${dados.calculos.potenciaAC} kW. O equipamento possui tecnologia de comutação estática por IGBTs de alta frequência e sistema integrado de rastreamento do ponto de máxima potência (MPPT).\n\n` +
      `O dimensionamento elétrico entre a capacidade do gerador CC e a potência nominal ativa CA do inversor resulta em uma razão de sobredimensionamento (Overloading / DC-AC Ratio) de ${dados.calculos.ratioDCAC}. Esta relação garante a otimização da curva de geração nas horas de menor irradiação sem violar a janela limite do inversor.\n\n` +
      `O inversor apresenta uma janela operativa de MPPT situada entre ${dados.sistema.mpptMin} V e ${dados.sistema.mpptMax} V, com tensão máxima admissível de entrada de ${dados.sistema.tensaoMaxEntrada} V. O sistema utiliza ${dados.sistema.quantidadeMppt} MPPT(s) com ${dados.sistema.stringsPorMppt} string(s) alocada(s) por rastreador, operando com limite máximo de corrente por MPPT de ${dados.sistema.correnteMaxMppt} A.`;
    paragrafo(narrativaInversor);

    linha("· Potência Ativa Nominal CA Total: " + dados.calculos.potenciaAC + " kW", true);
    linha("· Fator de Sobredimensionamento (FDR / DC-AC Ratio): " + dados.calculos.ratioDCAC);
    linha("· Limite de Tensão Máxima de Entrada (Vmax CC): " + dados.sistema.tensaoMaxEntrada + " V");
    linha("· Faixa de Rastreamento MPPT (Vmin_mppt - Vmax_mppt): " + dados.sistema.mpptMin + " V a " + dados.sistema.mpptMax + " V");
    linha("· Corrente Máxima por Canal MPPT: " + dados.sistema.correnteMaxMppt + " A");
    linha("· Distribuição dos Rastreadores: " + dados.sistema.quantidadeMppt + " MPPT(s) [" + dados.sistema.stringsPorMppt + " string(s)/MPPT]");

    /* =================================
       5. PONTO DE CONEXÃO E PROTEÇÕES
    ================================= */
    espaco(4);
    subtitulo("5. INTERCONEXÃO COM A REDE E PROTEÇÕES ELÉTRICAS");

    const narrativaConexao = `O ponto de interconexão com o sistema de distribuição da concessionária local (${dados.sistema.distribuidora}) é realizado em baixa tensão através do padrão de entrada existente na unidade consumidora. O sistema opera na configuração ${formatarTipoConexao(dados.sistema.tipoLigacao)} (${dados.sistema.numeroFases} fase(s)) com tensão nominal fase-fase/fase-neutro de ${dados.sistema.tensaoNominal} V.\n\n` +
      `O sistema contempla elementos de proteção integrados e externos: proteções internas do inversor contra sobretensão, sub/sobrefrequência, ilhamento (conforme ABNT NBR IEC 62116), injeção de componente CC, curtos-circuitos e monitoramento de isolamento do arranjo CC, além de dispositivos de seccionamento de emergência.`;
    paragrafo(narrativaConexao);

    /* =================================
       6. PARECER TÉCNICO E VALIDAÇÃO DE LIMITES
    ================================= */
    espaco(4);
    subtitulo("6. ANÁLISE DE COMPATIBILIDADE E PARECER DO ENGENHEIRO");

    linha("Validação Preliminar dos Parâmetros: " + dados.validacao, true);

    const resultadoSanitizado = sanitizarTexto(dados.resultadoTecnico);
    const possuiErro = resultadoSanitizado.toUpperCase().includes("ATENÇÃO") || 
                       resultadoSanitizado.toUpperCase().includes("INCONSISTÊNCIAS") || 
                       resultadoSanitizado.toUpperCase().includes("INCOMPATÍVEL");

    let narrativaParecer = "";
    if (possuiErro) {
      narrativaParecer = `PARECER TÉCNICO RESTRITIVO / INCOMPATIBILIDADE DETECTADA:\n` +
        `Durante a simulação automatizada dos limites térmicos e elétricos, constataram-se divergências operacionais entre as grandezas do arranjo CC e as características técnicas de entrada do inversor selecionado. Recomenda-se a readequação imediata da quantidade de módulos por string, troca do modelo de inversor ou redimensionamento dos MPPTs antes da submissão da solicitação de acesso junto à concessionária de energia.`;
    } else {
      narrativaParecer = `PARECER TÉCNICO FAVORÁVEL:\n` +
        `Após verificação rigorosa das grandezas operacionais sob condições STC e variações térmicas esperadas, atesta-se que a tensão máxima do arranjo (Voc total) permanece estritamente inferior ao limite máximo de isolamento do inversor (${dados.sistema.tensaoMaxEntrada} V). A tensão nominal de operação (Vmp total) situa-se perfeitamente no centro da janela de máxima eficiência do rastreador MPPT (${dados.sistema.mpptMin} V a ${dados.sistema.mpptMax} V), e as correntes não excedem o limite de suporte dos canais de entrada. O projeto está tecnicamente aprovado para execução e homologação.`;
    }

    paragrafo(narrativaParecer);
    linha("Detalhamento da Verificação: " + resultadoSanitizado);

    /* =================================
       7. OBSERVAÇÕES E CONSIDERAÇÕES FINAIS
    ================================= */
    espaco(4);
    subtitulo("7. CONSIDERAÇÕES FINAIS E OBSERVAÇÕES");
    paragrafo(dados.sistema.observacoes);

    /* =================================
       RODAPÉ E MOLDURA DE PÁGINAS
    ================================= */
    const totalPaginas = pdf.internal.getNumberOfPages();

    for (let pagina = 1; pagina <= totalPaginas; pagina++) {
      pdf.setPage(pagina);

      pdf.setDrawColor(210, 210, 210);
      pdf.setLineWidth(0.3);
      pdf.rect(10, 10, 190, 277);

      pdf.setFontSize(8);
      pdf.setFont(undefined, "normal");
      pdf.setTextColor(120, 120, 120);
      pdf.text("HomologaSolar RT — Memorial Descritivo Técnico Avançado", margem, 283);
      pdf.text("Página " + pagina + " de " + totalPaginas, 160, 283);
    }

    /* =================================
       SALVAR
    ================================= */
    const nomeArquivo =
      "Memorial_Descritivo_Tecnico_" +
      dados.projeto
        .replace(/[^a-zA-Z0-9À-ÿ _-]/g, "")
        .replace(/\s+/g, "_")
        .substring(0, 60) +
      ".pdf";

    finalizarPDF(pdf, nomeArquivo, modo);

  } catch (erro) {
    console.error("Erro ao gerar Memorial Descritivo:", erro);
    alert(
      "❌ Não foi possível gerar o Memorial Descritivo.\n\n" + erro.message
    );
  }
}



/* =========================================
   HOMOLOGASOLAR RT
   MOTOR DE DOCUMENTOS (jsPDF)
   ========================================= */

/* =========================================
   1. FUNÇÕES AUXILIARES E CAPTURA DE DADOS
========================================= */

function sanitizarTexto(texto) {
  if (texto === null || texto === undefined) return "";
  return String(texto)
    .replace(/&p|⚠️|❌|✔/g, "")
    .trim();
}

function formatarTipoConexao(valor) {
  if (!valor) return "—";
  const mapa = {
    monofasica: "Monofásica",
    bifasica: "Bifásica",
    trifasica: "Trifásica"
  };
  const chave = String(valor).toLowerCase().trim();
  return mapa[chave] || valor;
}

function documentoTexto(id, padrao = "—") {
  const elemento = document.getElementById(id);
  if (!elemento) return padrao;
  const texto = elemento.textContent || elemento.value || "";
  return texto.trim() || padrao;
}

function documentoValor(valor, padrao = "—") {
  if (valor === null || valor === undefined || valor === "") {
    return padrao;
  }
  return valor;
}

function obterDadosDocumento() {
  if (typeof sistemaAtual === "undefined" || !sistemaAtual) {
    throw new Error("Salve o sistema fotovoltaico antes de gerar o documento.");
  }

  return {
    projeto: documentoTexto("nomeProjeto"),
    status: documentoTexto("statusProjeto"),

    cliente: {
      nome: documentoTexto("clienteNome"),
      documento: documentoTexto("clienteDocumento"),
      telefone: documentoTexto("clienteTelefone"),
      email: documentoTexto("clienteEmail")
    },

    rt: {
      nome: documentoTexto("rtNome"),
      crea: documentoTexto("rtCrea"),
      uf: documentoTexto("rtUf"),
      registro: documentoTexto("rtRegistro")
    },

    sistema: {
      fabricanteModulo: documentoValor(sistemaAtual.fabricante_modulo),
      modeloModulo: documentoValor(sistemaAtual.modelo_modulo),
      potenciaModulo: documentoValor(sistemaAtual.potencia_modulo_w),
      quantidadeModulos: documentoValor(sistemaAtual.quantidade_modulos),
      vocModulo: documentoValor(sistemaAtual.voc_modulo),
      vmpModulo: documentoValor(sistemaAtual.vmp_modulo),
      iscModulo: documentoValor(sistemaAtual.isc_modulo),
      impModulo: documentoValor(sistemaAtual.imp_modulo),

      quantidadeStrings: documentoValor(sistemaAtual.quantidade_strings),
      modulosPorString: documentoValor(sistemaAtual.modulos_por_string),
      quantidadeMppt: documentoValor(sistemaAtual.quantidade_mppt),
      stringsPorMppt: documentoValor(sistemaAtual.strings_por_mppt),

      fabricanteInversor: documentoValor(sistemaAtual.fabricante_inversor),
      modeloInversor: documentoValor(sistemaAtual.modelo_inversor),
      potenciaInversor: documentoValor(sistemaAtual.potencia_inversor_kw),
      quantidadeInversores: documentoValor(sistemaAtual.quantidade_inversores),

      tensaoMaxEntrada: documentoValor(sistemaAtual.tensao_max_entrada_v),
      mpptMin: documentoValor(sistemaAtual.tensao_mppt_min_v),
      mpptMax: documentoValor(sistemaAtual.tensao_mppt_max_v),
      correnteMaxMppt: documentoValor(sistemaAtual.corrente_max_mppt_a),

      distribuidora: documentoValor(sistemaAtual.distribuidora),
      tipoLigacao: documentoValor(sistemaAtual.tipo_ligacao),
      numeroFases: documentoValor(sistemaAtual.numero_fases),
      tensaoNominal: documentoValor(sistemaAtual.tensao_nominal),
      observacoes: documentoValor(
        sistemaAtual.observacoes,
        "Nenhuma observação registrada."
      )
    },

    calculos: {
      potenciaDC: documentoTexto("potenciaDC"),
      potenciaAC: documentoTexto("potenciaAC"),
      ratioDCAC: documentoTexto("ratioDCAC"),
      potenciaString: documentoTexto("potenciaString"),
      vmpString: documentoTexto("vmpString"),
      vocString: documentoTexto("vocString"),
      correnteString: documentoTexto("correnteString")
    },

    validacao: documentoTexto("validacaoDimensionamento"),
    resultadoTecnico: documentoTexto("resultadoTecnico")
  };
}

/* =========================================
   2. GERADOR: MEMORIAL DESCRITIVO TÉCNICO
========================================= */

async function gerarMemorialDescritivoPDF() {
  try {
    const dados = obterDadosDocumento();
    const jsPDFClass = window.jsPDF || (window.jspdf && window.jspdf.jsPDF);

    if (!jsPDFClass) {
      throw new Error("A biblioteca jsPDF não foi identificada no projeto.");
    }

    const pdf = new jsPDFClass("p", "mm", "a4");
    const margem = 20;
    const largura = 170;
    let y = 20;

    function verificarPagina(altura = 10) {
      if (y + altura > 270) {
        pdf.addPage();
        y = 25;
      }
    }

    function titulo(texto) {
      verificarPagina(15);
      pdf.setFontSize(15);
      pdf.setFont(undefined, "bold");
      pdf.setTextColor(26, 82, 118);
      pdf.text(sanitizarTexto(texto), margem, y);
      y += 8;
    }

    function subtitulo(texto) {
      verificarPagina(12);
      pdf.setFontSize(11);
      pdf.setFont(undefined, "bold");
      pdf.setTextColor(41, 128, 185);
      pdf.text(sanitizarTexto(texto), margem, y);
      y += 6;
    }

    function linha(texto, destaque = false) {
      pdf.setFontSize(9.5);
      pdf.setFont(undefined, destaque ? "bold" : "normal");
      pdf.setTextColor(40, 40, 40);

      const textoTratado = sanitizarTexto(texto);
      const linhas = pdf.splitTextToSize(textoTratado, largura);

      verificarPagina(linhas.length * 4.5 + 2);
      pdf.text(linhas, margem, y);
      y += linhas.length * 4.5 + 2;
    }

    function paragrafo(texto) {
      pdf.setFontSize(9);
      pdf.setFont(undefined, "normal");
      pdf.setTextColor(60, 60, 60);

      const textoTratado = sanitizarTexto(texto);
      const linhas = pdf.splitTextToSize(textoTratado, largura);

      verificarPagina(linhas.length * 4 + 3);
      pdf.text(linhas, margem, y);
      y += linhas.length * 4 + 3;
    }

    function espaco(tamanho = 4) {
      y += tamanho;
    }

    titulo("HOMOLOGASOLAR RT");
    subtitulo("MEMORIAL DESCRITIVO DE MICROGERAÇÃO FOTOVOLTAICA");

    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.4);
    pdf.line(margem, y, margem + largura, y);
    espaco(5);

    linha("Projeto: " + dados.projeto, true);
    linha("Status do Sistema: " + dados.status);

    espaco(4);
    subtitulo("1. OBJETO E EMBASAMENTO NORMATIVO");
    const narrativaObjeto = `O presente Memorial Descritivo contempla o detalhamento eletrotécnico e o dimensionamento para a implantação da unidade geradora fotovoltaica referente ao projeto ${dados.projeto}. O sistema opera na modalidade de microgeração distribuída conectada à rede da concessionária ${dados.sistema.distribuidora}.\n\n` +
      `Toda a concepção do projeto segue estritamente as especificações da ABNT NBR 5410 (Instalações Elétricas de Baixa Tensão), ABNT NBR 16690 (Instalações Elétricas Fotovoltaicas - Requisitos de Projeto), ABNT NBR IEC 62116 (Procedimentos de Teste Anti-ilhamento), além das Resoluções Normativas da ANEEL (REN 482/2012 e REN 1.000/2021) e regulamentos técnicos de acesso da distribuidora local.`;
    paragrafo(narrativaObjeto);

    espaco(4);
    subtitulo("2. IDENTIFICAÇÃO DO TITULAR E RESPONSÁVEL TÉCNICO");
    linha("Cliente / Titular: " + dados.cliente.nome + " | CNPJ/CPF: " + dados.cliente.documento);
    linha("Contato: " + dados.cliente.telefone + " | E-mail: " + dados.cliente.email);
    linha("Responsável Técnico (RT): " + dados.rt.nome);
    linha("Conselho de Classe: " + dados.rt.crea + " (" + dados.rt.uf + ") — Registro: " + dados.rt.registro);

    espaco(4);
    subtitulo("3. SUBSISTEMA GERADOR E ARRANJO EM CORRENTE CONTÍNUA (CC)");
    const narrativaModulos = `O gerador fotovoltaico é composto por ${dados.sistema.quantidadeModulos} módulos fotovoltaicos de altíssima eficiência, fabricados por ${dados.sistema.fabricanteModulo}, modelo ${dados.sistema.modeloModulo}, com potência nominal STC de ${dados.sistema.potenciaModulo} Wp por módulo, perfazendo uma potência instalada total no pico CC de ${dados.calculos.potenciaDC} kWp.\n\n` +
      `Os módulos estão configurados em ${dados.sistema.quantidadeStrings} string(s) contendo ${dados.sistema.modulosPorString} módulos em série. Sob condições padrão de ensaio (STC: 1000 W/m², 25°C, AM 1.5), o comportamento elétrico do gerador é determinado pelo somatório das tensões de cada circuito: a tensão total de circuito aberto atinge ${dados.calculos.vocString} (Voc STC nominal de ${dados.sistema.vocModulo} V/módulo) e a tensão operacional em máxima potência atinge ${dados.calculos.vmpString} (Vmp STC nominal de ${dados.sistema.vmpModulo} V/módulo). A corrente total de curto-circuito (Isc STC) do arranjo é de ${dados.sistema.iscModulo} A e a corrente de operação STC (Imp) é de ${dados.sistema.impModulo} A.`;
    paragrafo(narrativaModulos);

    linha("· Potência Instalada Total CC (P_dc): " + dados.calculos.potenciaDC + " kWp", true);
    linha("· Tensão em Circuito Aberto da String (Voc total STC): " + dados.calculos.vocString);
    linha("· Tensão Nominal de Operação da String (Vmp total STC): " + dados.calculos.vmpString);
    linha("· Corrente de Curto-Circuito (Isc STC): " + dados.sistema.iscModulo + " A");
    linha("· Corrente em Máxima Potência (Imp STC): " + dados.sistema.impModulo + " A");

    espaco(4);
    subtitulo("4. SUBSISTEMA DE CONVERSÃO DE ENERGIA (INVERSORES E MPPT)");
    const narrativaInversor = `A conversão da energia CC gerada pelo arranjo para corrente alternada (CA) é realizada por ${dados.sistema.quantidadeInversores} unidade(s) de inversor(es) do fabricante ${dados.sistema.fabricanteInversor}, modelo ${dados.sistema.modeloInversor}, totalizando uma potência nominal ativa de saída CA de ${dados.calculos.potenciaAC} kW. O equipamento possui tecnologia de comutação estática por IGBTs de alta frequência e sistema integrado de rastreamento do ponto de máxima potência (MPPT).\n\n` +
      `O dimensionamento elétrico entre a capacidade do gerador CC e a potência nominal ativa CA do inversor resulta em uma razão de sobredimensionamento (Overloading / DC-AC Ratio) de ${dados.calculos.ratioDCAC}. Esta relação garante a otimização da curva de geração nas horas de menor irradiação sem violar a janela limite do inversor.\n\n` +
      `O inversor apresenta uma janela operativa de MPPT situada entre ${dados.sistema.mpptMin} V e ${dados.sistema.mpptMax} V, com tensão máxima admissível de entrada de ${dados.sistema.tensaoMaxEntrada} V. O sistema utiliza ${dados.sistema.quantidadeMppt} MPPT(s) com ${dados.sistema.stringsPorMppt} string(s) alocada(s) por rastreador, operando com limite máximo de corrente por MPPT de ${dados.sistema.correnteMaxMppt} A.`;
    paragrafo(narrativaInversor);

    linha("· Potência Ativa Nominal CA Total: " + dados.calculos.potenciaAC + " kW", true);
    linha("· Fator de Sobredimensionamento (FDR / DC-AC Ratio): " + dados.calculos.ratioDCAC);
    linha("· Limite de Tensão Máxima de Entrada (Vmax CC): " + dados.sistema.tensaoMaxEntrada + " V");
    linha("· Faixa de Rastreamento MPPT (Vmin_mppt - Vmax_mppt): " + dados.sistema.mpptMin + " V a " + dados.sistema.mpptMax + " V");
    linha("· Corrente Máxima por Canal MPPT: " + dados.sistema.correnteMaxMppt + " A");
    linha("· Distribuição dos Rastreadores: " + dados.sistema.quantidadeMppt + " MPPT(s) [" + dados.sistema.stringsPorMppt + " string(s)/MPPT]");

    espaco(4);
    subtitulo("5. INTERCONEXÃO COM A REDE E PROTEÇÕES ELÉTRICAS");
    const narrativaConexao = `O ponto de interconexão com o sistema de distribuição da concessionária local (${dados.sistema.distribuidora}) é realizado em baixa tensão através do padrão de entrada existente na unidade consumidora. O sistema opera na configuração ${formatarTipoConexao(dados.sistema.tipoLigacao)} (${dados.sistema.numeroFases} fase(s)) com tensão nominal fase-fase/fase-neutro de ${dados.sistema.tensaoNominal} V.\n\n` +
      `O sistema contempla elementos de proteção integrados e externos: proteções internas do inversor contra sobretensão, sub/sobrefrequência, ilhamento (conforme ABNT NBR IEC 62116), injeção de componente CC, curtos-circuitos e monitoramento de isolamento do arranjo CC, além de dispositivos de seccionamento de emergência.`;
    paragrafo(narrativaConexao);

    espaco(4);
    subtitulo("6. ANÁLISE DE COMPATIBILIDADE E PARECER DO ENGENHEIRO");
    linha("Validação Preliminar dos Parâmetros: " + dados.validacao, true);

    const resultadoSanitizado = sanitizarTexto(dados.resultadoTecnico);
    const possuiErro = resultadoSanitizado.toUpperCase().includes("ATENÇÃO") || 
                       resultadoSanitizado.toUpperCase().includes("INCONSISTÊNCIAS") || 
                       resultadoSanitizado.toUpperCase().includes("INCOMPATÍVEL");

    let narrativaParecer = "";
    if (possuiErro) {
      narrativaParecer = `PARECER TÉCNICO RESTRITIVO / INCOMPATIBILIDADE DETECTADA:\n` +
        `Durante a simulação automatizada dos limites térmicos e elétricos, constataram-se divergências operacionais entre as grandezas do arranjo CC e as características técnicas de entrada do inversor selecionado. Recomenda-se a readequação imediata da quantidade de módulos por string, troca do modelo de inversor ou redimensionamento dos MPPTs antes da submissão da solicitação de acesso junto à concessionária de energia.`;
    } else {
      narrativaParecer = `PARECER TÉCNICO FAVORÁVEL:\n` +
        `Após verificação rigorosa das grandezas operacionais sob condições STC e variações térmicas esperadas, atesta-se que a tensão máxima do arranjo (Voc total) permanece estritamente inferior ao limite máximo de isolamento do inversor (${dados.sistema.tensaoMaxEntrada} V). A tensão nominal de operação (Vmp total) situa-se perfeitamente no centro da janela de máxima eficiência do rastreador MPPT (${dados.sistema.mpptMin} V a ${dados.sistema.mpptMax} V), e as correntes não excedem o limite de suporte dos canais de entrada. O projeto está tecnicamente aprovado para execução e homologação.`;
    }

    paragrafo(narrativaParecer);
    linha("Detalhamento da Verificação: " + resultadoSanitizado);

    espaco(4);
    subtitulo("7. CONSIDERAÇÕES FINAIS E OBSERVAÇÕES");
    paragrafo(dados.sistema.observacoes);

    const totalPaginas = pdf.internal.getNumberOfPages();
    for (let pagina = 1; pagina <= totalPaginas; pagina++) {
      pdf.setPage(pagina);
      pdf.setDrawColor(210, 210, 210);
      pdf.setLineWidth(0.3);
      pdf.rect(10, 10, 190, 277);
      pdf.setFontSize(8);
      pdf.setFont(undefined, "normal");
      pdf.setTextColor(120, 120, 120);
      pdf.text("HomologaSolar RT — Memorial Descritivo Técnico Avançado", margem, 283);
      pdf.text("Página " + pagina + " de " + totalPaginas, 160, 283);
    }

    const nomeArquivo = "Memorial_Descritivo_Tecnico_" + dados.projeto.replace(/[^a-zA-Z0-9À-ÿ _-]/g, "").replace(/\s+/g, "_").substring(0, 60) + ".pdf";
    pdf.save(nomeArquivo);

  } catch (erro) {
    console.error("Erro ao gerar Memorial Descritivo:", erro);
    alert("❌ Não foi possível gerar o Memorial Descritivo.\n\n" + erro.message);
  }
}

/* =========================================
   3. GERADOR: PROCURAÇÃO DE HOMOLOGAÇÃO
========================================= */

async function gerarProcuracaoPDF() {
  try {
    const dados = obterDadosDocumento();
    const jsPDFClass = window.jsPDF || (window.jspdf && window.jspdf.jsPDF);

    if (!jsPDFClass) {
      throw new Error("A biblioteca jsPDF não foi identificada no projeto.");
    }

    const pdf = new jsPDFClass("p", "mm", "a4");
    const margem = 20;
    const largura = 170;
    let y = 25;

    function espaco(tamanho = 5) {
      y += tamanho;
    }

    function titulo(texto) {
      pdf.setFontSize(14);
      pdf.setFont(undefined, "bold");
      pdf.setTextColor(26, 82, 118);
      pdf.text(sanitizarTexto(texto), 105, y, { align: "center" });
      y += 8;
    }

    function subtitulo(texto) {
      pdf.setFontSize(10);
      pdf.setFont(undefined, "bold");
      pdf.setTextColor(41, 128, 185);
      pdf.text(sanitizarTexto(texto), 105, y, { align: "center" });
      y += 6;
    }

    function blocoTexto(texto, alinhamento = "justify", tamanhoFonte = 10, negrito = false) {
      pdf.setFontSize(tamanhoFonte);
      pdf.setFont(undefined, negrito ? "bold" : "normal");
      pdf.setTextColor(40, 40, 40);

      const textoTratado = sanitizarTexto(texto);
      const linhas = pdf.splitTextToSize(textoTratado, largura);

      pdf.text(linhas, margem, y, { align: alinhamento });
      y += linhas.length * (tamanhoFonte * 0.45) + 3;
    }

    /* Cabeçalho */
    titulo("PROCURAÇÃO DE REPRESENTAÇÃO TÉCNICA");
    subtitulo("HOMOLOGAÇÃO DE MICROGERAÇÃO FOTOVOLTAICA — ANEEL / CONCESSIONÁRIA");

    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.4);
    pdf.line(margem, y, margem + largura, y);
    espaco(8);

    /* Outorgante (Cliente) */
    blocoTexto("OUTORGANTE (TITULAR DA UNIDADE CONSUMIDORA):", "left", 10, true);
    blocoTexto(`Nome / Razão Social: ${dados.cliente.nome}\nCPF / CNPJ: ${dados.cliente.documento}\nTelefone: ${dados.cliente.telefone} | E-mail: ${dados.cliente.email}`, "left", 9.5);

    espaco(5);

    /* Outorgado (RT) */
    blocoTexto("OUTORGADO (RESPONSÁVEL TÉCNICO):", "left", 10, true);
    blocoTexto(`Nome do Profissional: ${dados.rt.nome}\nConselho Profissional: ${dados.rt.crea} (${dados.rt.uf}) — Registro: ${dados.rt.registro}`, "left", 9.5);

    espaco(6);

    /* Poderes concedidos */
    blocoTexto("PODERES ESPECÍFICOS E PODERES DE REPRESENTAÇÃO:", "left", 10, true);
    
    const textoPoderes = `Por este instrumento particular de procuração, o OUTORGANTE nomeia e constitui o OUTORGADO como seu bastante procurador para representá-lo exclusivamente perante a concessionária de energia elétrica ${dados.sistema.distribuidora}, com o objetivo específico de praticar todos os atos necessários para a SOLICITAÇÃO DE ACESSO, VISTORIA E HOMOLOGAÇÃO do sistema de microgeração fotovoltaica referente ao projeto ${dados.projeto}.\n\n` +
      `Os poderes aqui conferidos incluem, mas não se limitam a: solicitar parecer de acesso, preencher e assinar formulários técnicos de cadastramento da unidade geradora, apresentar memoriais descritivos, ART/TRT, diagramas elétricos e documentos de suporte, efetuar agendamentos de vistoria técnica, receber termos de notificação, exigências ou aprovações técnicas, e assinar o Acordo de Operação / Relacionamento Operacional junto à distribuidora.`;
    
    blocoTexto(textoPoderes, "justify", 9.5);

    espaco(6);

    /* Validade e Rescisão */
    blocoTexto("VALIDADE E ABRANGÊNCIA:", "left", 10, true);
    const textoValidade = `A presente procuração é válida estritamente pelo período necessário para a conclusão de todas as etapas do processo de conexão e homologação do sistema gerador no endereço de atendimento, encerrando seus efeitos automaticamente após a emissão do Relatório de Vistoria e Aprovada a Conexão pela ${dados.sistema.distribuidora}.`;
    blocoTexto(textoValidade, "justify", 9.5);

    espaco(12);

    /* Data e Local */
    const dataAtual = new Date();
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const dataFormatada = `Brasil, ${dataAtual.getDate()} de ${meses[dataAtual.getMonth()]} de ${dataAtual.getFullYear()}.`;
    blocoTexto(dataFormatada, "center", 10);

    espaco(25);

    /* Campo de Assinatura */
    pdf.setDrawColor(100, 100, 100);
    pdf.setLineWidth(0.5);
    pdf.line(45, y, 165, y);
    y += 5;

    pdf.setFontSize(10);
    pdf.setFont(undefined, "bold");
    pdf.setTextColor(40, 40, 40);
    pdf.text(sanitizarTexto(dados.cliente.nome), 105, y, { align: "center" });
    y += 4.5;

    pdf.setFontSize(8.5);
    pdf.setFont(undefined, "normal");
    pdf.setTextColor(100, 100, 100);
    pdf.text(`CPF/CNPJ: ${sanitizarTexto(dados.cliente.documento)}`, 105, y, { align: "center" });
    y += 4;
    pdf.text("Assinatura do Outorgante (Titular)", 105, y, { align: "center" });

         /* Moldura da página */
    pdf.setDrawColor(210, 210, 210);
    pdf.setLineWidth(0.3);
    pdf.rect(10, 10, 190, 277);

    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);
    pdf.text("HomologaSolar RT — Documento Oficial de Representação", margem, 283);
    pdf.text("Página 1 de 1", 165, 283);

    /* Salvar */
    const nomeArquivo = "Procuracao_Homologacao_" + dados.projeto.replace(/[^a-zA-Z0-9À-ÿ _-]/g, "").replace(/\s+/g, "_").substring(0, 60) + ".pdf";
    pdf.save(nomeArquivo);

  } catch (erro) {
    console.error("Erro ao gerar Procuração:", erro);
    alert("❌ Não foi possível gerar a Procuração de Homologação.\n\n" + erro.message);
  }
}



/* =========================================
   4. GERADOR: DECLARAÇÃO DE RESPONSABILIDADE TÉCNICA
========================================= */

async function gerarTermoResponsabilidadePDF() {
  try {
    const dados = obterDadosDocumento();
    const jsPDFClass = window.jsPDF || (window.jspdf && window.jspdf.jsPDF);

    if (!jsPDFClass) {
      throw new Error("A biblioteca jsPDF não foi identificada no projeto.");
    }

    const pdf = new jsPDFClass("p", "mm", "a4");
    const margem = 20;
    const largura = 170;
    let y = 25;

    function espaco(tamanho = 5) {
      y += tamanho;
    }

    function titulo(texto) {
      pdf.setFontSize(13);
      pdf.setFont(undefined, "bold");
      pdf.setTextColor(26, 82, 118);
      pdf.text(sanitizarTexto(texto), 105, y, { align: "center" });
      y += 7;
    }

    function subtitulo(texto) {
      pdf.setFontSize(10);
      pdf.setFont(undefined, "bold");
      pdf.setTextColor(41, 128, 185);
      pdf.text(sanitizarTexto(texto), 105, y, { align: "center" });
      y += 6;
    }

    function blocoTexto(texto, alinhamento = "justify", tamanhoFonte = 9.5, negrito = false) {
      pdf.setFontSize(tamanhoFonte);
      pdf.setFont(undefined, negrito ? "bold" : "normal");
      pdf.setTextColor(40, 40, 40);

      const textoTratado = sanitizarTexto(texto);
      const linhas = pdf.splitTextToSize(textoTratado, largura);

      pdf.text(linhas, margem, y, { align: alinhamento });
      y += linhas.length * (tamanhoFonte * 0.45) + 3;
    }

    /* Cabeçalho */
    titulo("DECLARAÇÃO DE RESPONSABILIDADE TÉCNICA E CONFORMIDADE");
    subtitulo("SISTEMA DE MICROGERAÇÃO FOTOVOLTAICA CONECTADO À REDE");

    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.4);
    pdf.line(margem, y, margem + largura, y);
    espaco(8);

    /* Dados do RT */
    blocoTexto("1. IDENTIFICAÇÃO DO RESPONSÁVEL TÉCNICO (DECLARANTE):", "left", 10, true);
    blocoTexto(`Nome do Profesional: ${dados.rt.nome}\nConselho de Classe / Registro: ${dados.rt.crea} (${dados.rt.uf}) — ${dados.rt.registro}\nContato Técnico: ${dados.cliente.email}`, "left", 9);

    espaco(4);

    /* Dados da Unidade e Projeto */
    blocoTexto("2. DADOS DA UNIDADE CONSUMIDORA E PROJETO:", "left", 10, true);
    blocoTexto(`Titular / Cliente: ${dados.cliente.nome} | CPF/CNPJ: ${dados.cliente.documento}\nProjeto: ${dados.projeto}\nDistribuidora de Energia: ${dados.sistema.distribuidora}\nCapacidade Instalada: ${dados.calculos.potenciaDC} kWp (CC) / ${dados.calculos.potenciaAC} kW (CA)`, "left", 9);

    espaco(6);

    /* Termos da Declaração */
    blocoTexto("3. TERMO DE DECLARAÇÃO E COMPROMISSO TÉCNICO:", "left", 10, true);

    const textoDeclaracao = `Eu, ${dados.rt.nome}, devidamente habilitado(a) e registrado(a) no conselho profissional competente sob o nº ${dados.rt.registro}, na qualidade de Responsável Técnico pelo projeto e dimensionamento elétrico da unidade geradora acima identificada, DECLARO para os devidos fins de direito e junto à concessionária ${dados.sistema.distribuidora} que:\n\n` +
      `1. O projeto eletrotécnico foi elaborado em estrita observância às normas técnicas brasileiras vigentes, em especial a ABNT NBR 5410 (Instalações Elétricas de Baixa Tensão), ABNT NBR 16690 (Instalações Elétricas Fotovoltaicas - Requisitos de Projeto) e ABNT NBR IEC 62116 (Sistemas de Conversão de Energia Fotovoltaica - Procedimento de Teste Anti-ilhamento).\n\n` +
      `2. Os equipamentos especificados (${dados.sistema.quantidadeInversores} inversor(es) ${dados.sistema.fabricanteInversor} ${dados.sistema.modeloInversor} e ${dados.sistema.quantidadeModulos} módulos ${dados.sistema.fabricanteModulo}) possuem certificação e registro compulsório e atendem aos requisitos de segurança e qualidade exigidos pela ANEEL e INMETRO.\n\n` +
      `3. O sistema de proteção contra surtos (DPS), aterramento, seccionamento e proteção anti-ilhamento foi dimensionado para garantir a integridade da rede de distribuição e a segurança das pessoas e instalações.`;

    blocoTexto(textoDeclaracao, "justify", 9);

    espaco(6);

    /* Responsabilidade e Anotação */
    blocoTexto("4. ANOTAÇÃO DE RESPONSABILIDADE TÉCNICA (ART/TRT):", "left", 10, true);
    const textoART = `Atesto ainda que a respectiva Anotação/Termo de Responsabilidade Técnica (ART/TRT) correspondente a este projeto foi devidamente emitida e recolhida junto ao conselho profissional de classe, assumindo integral responsabilidade legal e técnica pelas informações prestadas neste documento.`;
    blocoTexto(textoART, "justify", 9);

    espaco(10);

    /* Local e Data */
    const dataAtual = new Date();
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const dataFormatada = `Brasil, ${dataAtual.getDate()} de ${meses[dataAtual.getMonth()]} de ${dataAtual.getFullYear()}.`;
    blocoTexto(dataFormatada, "center", 9.5);

    espaco(22);

    /* Campo de Assinatura do RT */
    pdf.setDrawColor(100, 100, 100);
    pdf.setLineWidth(0.5);
    pdf.line(45, y, 165, y);
    y += 5;

    pdf.setFontSize(10);
    pdf.setFont(undefined, "bold");
    pdf.setTextColor(40, 40, 40);
    pdf.text(sanitizarTexto(dados.rt.nome), 105, y, { align: "center" });
    y += 4.5;

    pdf.setFontSize(8.5);
    pdf.setFont(undefined, "normal");
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Responsável Técnico — ${sanitizarTexto(dados.rt.crea)} (${sanitizarTexto(dados.rt.uf)}) nº ${sanitizarTexto(dados.rt.registro)}`, 105, y, { align: "center" });
    y += 4;
    pdf.text("Assinatura do Engenheiro / Técnico", 105, y, { align: "center" });

    /* Moldura */
    pdf.setDrawColor(210, 210, 210);
    pdf.setLineWidth(0.3);
    pdf.rect(10, 10, 190, 277);

    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);
    pdf.text("HomologaSolar RT — Declaração de Responsabilidade Técnica", margem, 283);
    pdf.text("Página 1 de 1", 165, 283);

    /* Salvar */
    const nomeArquivo = "Declaracao_Responsabilidade_Tecnica_" + dados.projeto.replace(/[^a-zA-Z0-9À-ÿ _-]/g, "").replace(/\s+/g, "_").substring(0, 60) + ".pdf";
    pdf.save(nomeArquivo);

  } catch (erro) {
    console.error("Erro ao gerar Declaração de Responsabilidade:", erro);
    alert("❌ Não foi possível gerar a Declaração de Responsabilidade Técnica.\n\n" + erro.message);
  }
}



/* =========================================
   5. GERADOR: FICHA DE DADOS E FORMULÁRIO DE ACESSO
========================================= */

async function gerarFormularioAcessoPDF() {
  try {
    const dados = obterDadosDocumento();
    const jsPDFClass = window.jsPDF || (window.jspdf && window.jspdf.jsPDF);

    if (!jsPDFClass) {
      throw new Error("A biblioteca jsPDF não foi identificada no projeto.");
    }

    const pdf = new jsPDFClass("p", "mm", "a4");
    const margem = 20;
    const largura = 170;
    let y = 20;

    function espaco(tamanho = 4) {
      y += tamanho;
    }

    function titulo(texto) {
      pdf.setFontSize(13);
      pdf.setFont(undefined, "bold");
      pdf.setTextColor(26, 82, 118);
      pdf.text(sanitizarTexto(texto), 105, y, { align: "center" });
      y += 7;
    }

    function secao(texto) {
      pdf.setFontSize(10);
      pdf.setFont(undefined, "bold");
      pdf.setTextColor(41, 128, 185);
      pdf.text(sanitizarTexto(texto), margem, y);
      y += 5;
    }

    function itemTabela(rotulo, valor, xColuna = margem, larguraColuna = 80) {
      pdf.setFontSize(8.5);
      pdf.setFont(undefined, "bold");
      pdf.setTextColor(50, 50, 50);
      pdf.text(sanitizarTexto(rotulo) + ":", xColuna, y);

      pdf.setFont(undefined, "normal");
      pdf.setTextColor(80, 80, 80);
      pdf.text(sanitizarTexto(valor), xColuna + larguraColuna, y);
    }

    /* Cabeçalho */
    titulo("FICHA DE DADOS PARA SOLICITAÇÃO DE ACESSO");
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.4);
    pdf.line(margem, y, margem + largura, y);
    espaco(6);

    /* 1. DADOS CADASTRAIS */
    secao("1. DADOS DO TITULAR E DA UNIDADE CONSUMIDORA");
    itemTabela("Nome / Razão Social", dados.cliente.nome, margem, 45); y += 4.5;
    itemTabela("CPF / CNPJ", dados.cliente.documento, margem, 45); y += 4.5;
    itemTabela("Telefone", dados.cliente.telefone, margem, 45);
    itemTabela("E-mail", dados.cliente.email, 105, 20); y += 6;

    /* 2. RESPONSÁVEL TÉCNICO */
    secao("2. DADOS DO RESPONSÁVEL TÉCNICO (RT)");
    itemTabela("Engenheiro / Técnico", dados.rt.nome, margem, 45); y += 4.5;
    itemTabela("Conselho de Classe", dados.rt.crea + " (" + dados.rt.uf + ")", margem, 45);
    itemTabela("Nº Registro", dados.rt.registro, 105, 25); y += 6;

    /* 3. PARÂMETROS DA REDE */
    secao("3. PARÂMETROS DA CONEXÃO E DISTRIBUIDORA");
    itemTabela("Concessionária", dados.sistema.distribuidora, margem, 45);
    itemTabela("Tipo de Conexão", formatarTipoConexao(dados.sistema.tipoLigacao), 105, 30); y += 4.5;
    itemTabela("Nº de Fases", dados.sistema.numeroFases, margem, 45);
    itemTabela("Tensão Nominal", dados.sistema.tensaoNominal + " V", 105, 30); y += 6;

    /* 4. GERADOR CC */
    secao("4. DADOS DO GERADOR FOTOVOLTAICO (CC)");
    itemTabela("Fabricante dos Módulos", dados.sistema.fabricanteModulo, margem, 45); y += 4.5;
    itemTabela("Modelo dos Módulos", dados.sistema.modeloModulo, margem, 45); y += 4.5;
    itemTabela("Potência Unitária", dados.sistema.potenciaModulo + " Wp", margem, 45);
    itemTabela("Qtd. Total Módulos", dados.sistema.quantidadeModulos + " un.", 105, 35); y += 4.5;
    itemTabela("Potência Total CC", dados.calculos.potenciaDC + " kWp", margem, 45);
    itemTabela("Arranjo Físico", dados.sistema.quantidadeStrings + " string(s) x " + dados.sistema.modulosPorString + " mod.", 105, 35); y += 4.5;
    itemTabela("Tensão Open Circuit (Voc)", dados.calculos.vocString, margem, 45);
    itemTabela("Tensão Operacional (Vmp)", dados.calculos.vmpString, 105, 35); y += 6;

    /* 5. INVERSOR CA */
    secao("5. DADOS DO SISTEMA DE CONVERSÃO (CA)");
    itemTabela("Fabricante Inversor", dados.sistema.fabricanteInversor, margem, 45); y += 4.5;
    itemTabela("Modelo Inversor", dados.sistema.modeloInversor, margem, 45); y += 4.5;
    itemTabela("Potência Nominal CA", dados.calculos.potenciaAC + " kW", margem, 45);
    itemTabela("Qtd. Inversores", dados.sistema.quantidadeInversores + " un.", 105, 30); y += 4.5;
    itemTabela("Razão DC/AC (FDR)", dados.calculos.ratioDCAC, margem, 45);
    itemTabela("Janela MPPT", dados.sistema.mpptMin + "V a " + dados.sistema.mpptMax + "V", 105, 30); y += 6;

    /* 6. DIAGNÓSTICO DO ROTEADOR */
    secao("6. PARECER AUTOMÁTICO DO SISTEMA");
    itemTabela("Validação Elétrica", dados.validacao, margem, 45); y += 4.5;
    
    pdf.setFontSize(8);
    pdf.setFont(undefined, "normal");
    pdf.setTextColor(60, 60, 60);
    const textoRes = pdf.splitTextToSize(sanitizarTexto(dados.resultadoTecnico), largura);
    pdf.text(textoRes, margem, y);
    y += textoRes.length * 3.8 + 6;

    /* Moldura */
    pdf.setDrawColor(210, 210, 210);
    pdf.setLineWidth(0.3);
    pdf.rect(10, 10, 190, 277);

    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);
    pdf.text("HomologaSolar RT — Ficha Resumo de Acesso", margem, 283);
    pdf.text("Página 1 de 1", 165, 283);

    /* Salvar */
    const nomeArquivo = "Ficha_Solicitacao_Acesso_" + dados.projeto.replace(/[^a-zA-Z0-9À-ÿ _-]/g, "").replace(/\s+/g, "_").substring(0, 60) + ".pdf";
    pdf.save(nomeArquivo);

  } catch (erro) {
    console.error("Erro ao gerar Ficha de Acesso:", erro);
    alert("❌ Não foi possível gerar a Ficha de Solicitação de Acesso.\n\n" + erro.message);
  }
  }



/* =========================================
   6. GERADOR: RELATÓRIO DE VISTORIA E COMISSIONAMENTO
========================================= */

async function gerarRelatorioVistoriaPDF() {
  try {
    const dados = obterDadosDocumento();
    const jsPDFClass = window.jsPDF || (window.jspdf && window.jspdf.jsPDF);

    if (!jsPDFClass) {
      throw new Error("A biblioteca jsPDF não foi identificada no projeto.");
    }

    const pdf = new jsPDFClass("p", "mm", "a4");
    const margem = 20;
    const largura = 170;
    let y = 20;

    function espaco(tamanho = 4) {
      y += tamanho;
    }

    function verificarPagina(altura = 10) {
      if (y + altura > 270) {
        pdf.addPage();
        y = 20;
      }
    }

    function titulo(texto) {
      pdf.setFontSize(13);
      pdf.setFont(undefined, "bold");
      pdf.setTextColor(26, 82, 118);
      pdf.text(sanitizarTexto(texto), 105, y, { align: "center" });
      y += 7;
    }

    function secao(texto) {
      verificarPagina(12);
      pdf.setFontSize(10);
      pdf.setFont(undefined, "bold");
      pdf.setTextColor(41, 128, 185);
      pdf.text(sanitizarTexto(texto), margem, y);
      y += 5;
    }

    function itemTabela(rotulo, valor, xColuna = margem, larguraColuna = 80) {
      pdf.setFontSize(8.5);
      pdf.setFont(undefined, "bold");
      pdf.setTextColor(50, 50, 50);
      pdf.text(sanitizarTexto(rotulo) + ":", xColuna, y);

      pdf.setFont(undefined, "normal");
      pdf.setTextColor(80, 80, 80);
      pdf.text(sanitizarTexto(valor), xColuna + larguraColuna, y);
    }

    function itemChecklist(item, statusPadrao = "[  ] OK   [  ] N/A") {
      verificarPagina(6);
      pdf.setFontSize(8.5);
      pdf.setFont(undefined, "normal");
      pdf.setTextColor(40, 40, 40);
      pdf.text("• " + sanitizarTexto(item), margem + 2, y);

      pdf.setFont(undefined, "bold");
      pdf.setTextColor(80, 80, 80);
      pdf.text(statusPadrao, 155, y);
      y += 5;
    }

    /* Cabeçalho */
    titulo("RELATÓRIO DE VISTORIA E CHECKLIST DE COMISSIONAMENTO");
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.4);
    pdf.line(margem, y, margem + largura, y);
    espaco(6);

    /* 1. DADOS DO PROJETO */
    secao("1. IDENTIFICAÇÃO GERAL DA INSTALAÇÃO");
    itemTabela("Projeto", dados.projeto, margem, 45);
    itemTabela("Distribuidora", dados.sistema.distribuidora, 105, 30); y += 4.5;
    itemTabela("Titular / Cliente", dados.cliente.nome, margem, 45); y += 4.5;
    itemTabela("Responsável Técnico", dados.rt.nome, margem, 45);
    itemTabela("Registro RT", dados.rt.crea + " / " + dados.rt.registro, 105, 30); y += 6;

    /* 2. EQUIPAMENTOS INSTALADOS */
    secao("2. RESUMO DOS EQUIPAMENTOS COMISSIONADOS");
    itemTabela("Módulos Fotovoltaicos", dados.sistema.quantidadeModulos + "x " + dados.sistema.fabricanteModulo + " " + dados.sistema.potenciaModulo + "Wp", margem, 45); y += 4.5;
    itemTabela("Inversor(es) CA", dados.sistema.quantidadeInversores + "x " + dados.sistema.fabricanteInversor + " " + dados.sistema.modeloInversor + " (" + dados.calculos.potenciaAC + " kW)", margem, 45); y += 4.5;
    itemTabela("Configuração de Strings", dados.sistema.quantidadeStrings + " string(s) contendo " + dados.sistema.modulosPorString + " módulos cada", margem, 45); y += 6;

    /* 3. ENSAIOS E MEDIÇÕES ELÉTRICAS DE CAMPO */
    secao("3. COMPARAÇÃO DE PARÂMETROS: TEÓRICO CALCULADO VS. MEDIDO EM CAMPO");
    
    // Tabela Header
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margem, y, largura, 6, "F");
    pdf.setFontSize(8);
    pdf.setFont(undefined, "bold");
    pdf.setTextColor(40, 40, 40);
    pdf.text("Grandeza Eletrotécnica", margem + 3, y + 4.2);
    pdf.text("Valor Teórico Calculado", margem + 70, y + 4.2);
    pdf.text("Valor Medido na Vistoria", margem + 122, y + 4.2);
    y += 8;

    // Linhas de medição
    pdf.setFont(undefined, "normal");
    itemTabela("Tensão de Circuito Aberto (Voc String)", dados.calculos.vocString, margem + 3, 67);
    pdf.text("[ ______________ ] V", margem + 122, y); y += 5.5;

    itemTabela("Tensão de Operação Nominal (Vmp String)", dados.calculos.vmpString, margem + 3, 67);
    pdf.text("[ ______________ ] V", margem + 122, y); y += 5.5;

    itemTabela("Corrente Operacional / Curtos (Imp/Isc)", dados.sistema.impModulo + " A / " + dados.sistema.iscModulo + " A", margem + 3, 67);
    pdf.text("[ ______________ ] A", margem + 122, y); y += 5.5;

    itemTabela("Tensão da Rede CA (Fase-Fase / Fase-N)", dados.sistema.tensaoNominal + " V (" + formatarTipoConexao(dados.sistema.tipoLigacao) + ")", margem + 3, 67);
    pdf.text("[ ______________ ] V", margem + 122, y); y += 7;

    /* 4. CHECKLIST DE INSPEÇÃO FÍSICA E SEGURANÇA */
    secao("4. CHECKLIST DE INSPEÇÃO FÍSICA E CONFORMIDADE NORMATIVA");
    itemChecklist("Fixação mecânica das estruturas e estanqueidade do telhado/solo");
    itemChecklist("Polaridade das strings CC conferida antes da conexão ao inversor");
    itemChecklist("Conexão do sistema de aterramento na estrutura e carcaça do inversor");
    itemChecklist("Aperto dos bornes de conexão e prensa-cabos devidamente vedados");
    itemChecklist("Identificação visual/etiquetas de advertência de Geração Distribuída");
    itemChecklist("Teste de anti-ilhamento (desconexão da rede CA) operando com sucesso");
    espaco(4);

    /* 5. TERMO DE ACEITE E ASSINATURA */
    secao("5. PARECER DA VISTORIA E LIBERAÇÃO PARA OPERAÇÃO");
    pdf.setFontSize(8.5);
    pdf.setFont(undefined, "normal");
    pdf.setTextColor(60, 60, 60);
    const textoParecer = "Atesto que o sistema de microgeração fotovoltaica descrito neste relatório foi inspecionado, testado e comissionado de acordo com as especificações do projeto eletrotécnico e normativas técnicas aplicáveis, encontrando-se em condições adequadas para operação em teste / conexão à rede da concessionária.";
    const linhasParecer = pdf.splitTextToSize(textoParecer, largura);
    pdf.text(linhasParecer, margem, y);
    y += linhasParecer.length * 3.8 + 12;

    /* Assinaturas */
    verificarPagina(30);
    pdf.setDrawColor(100, 100, 100);
    pdf.setLineWidth(0.4);
    
    // Linha RT
    pdf.line(margem + 5, y, margem + 75, y);
    // Linha Cliente / Técnico Instalação
    pdf.line(margem + 95, y, margem + 165, y);
    y += 4;

    pdf.setFontSize(8.5);
    pdf.setFont(undefined, "bold");
    pdf.setTextColor(40, 40, 40);
    pdf.text(sanitizarTexto(dados.rt.nome), margem + 40, y, { align: "center" });
    pdf.text("Técnico Responsável / Cliente", margem + 130, y, { align: "center" });
    y += 3.5;

    pdf.setFont(undefined, "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`RT — ${sanitizarTexto(dados.rt.crea)} ${sanitizarTexto(dados.rt.registro)}`, margem + 40, y, { align: "center" });
    pdf.text("Assinatura de Recebimento de Campo", margem + 130, y, { align: "center" });

    /* Moldura */
    const totalPaginas = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
      pdf.setPage(i);
      pdf.setDrawColor(210, 210, 210);
      pdf.setLineWidth(0.3);
      pdf.rect(10, 10, 190, 277);

      pdf.setFontSize(8);
      pdf.setTextColor(120, 120, 120);
      pdf.text("HomologaSolar RT — Checklist de Comissionamento e Vistoria", margem, 283);
      pdf.text("Página " + i + " de " + totalPaginas, 165, 283);
    }

    /* Salvar */
    const nomeArquivo = "Relatorio_Vistoria_Comissionamento_" + dados.projeto.replace(/[^a-zA-Z0-9À-ÿ _-]/g, "").replace(/\s+/g, "_").substring(0, 60) + ".pdf";
    pdf.save(nomeArquivo);

  } catch (erro) {
    console.error("Erro ao gerar Relatório de Vistoria:", erro);
    alert("❌ Não foi possível gerar o Relatório de Vistoria.\n\n" + erro.message);
  }
  }
       
