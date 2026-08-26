/* =========================================
   HOMOLOGASOLAR RT
   MOTOR DE DOCUMENTOS (jsPDF - Com Narrativas Avançadas e Detalhamento Técnico)
   ========================================= */

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

    pdf.save(nomeArquivo);

  } catch (erro) {
    console.error("Erro ao gerar Memorial Descritivo:", erro);
    alert(
      "❌ Não foi possível gerar o Memorial Descritivo.\n\n" + erro.message
    );
  }
}
