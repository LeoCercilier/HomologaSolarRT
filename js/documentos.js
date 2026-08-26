/* =========================================
   HOMOLOGASOLAR RT
   MOTOR DE DOCUMENTOS (jsPDF - Com Narrativas Automáticas)
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
       1. OBJETO E OBJETIVO (NARRATIVA)
    ================================= */
    espaco(4);
    subtitulo("1. OBJETO E OBJETIVO");
    
    const narrativaObjeto = `O presente Memorial Descritivo tem por objetivo dimensionar e especificar tecnicamente o sistema de microgeração distribuída fotovoltaica para o projeto ${dados.projeto}. O sistema foi projetado para operar conectado à rede de distribuição da concessionária ${dados.sistema.distribuidora}, atendendo aos requisitos das normas ABNT NBR 5410, NBR 16690 e regulamentações vigentes da ANEEL.`;
    paragrafo(narrativaObjeto);

    /* =================================
       2. DADOS DAS PARTES
    ================================= */
    espaco(4);
    subtitulo("2. DADOS DO CLIENTE E RESPONSÁVEL TÉCNICO");
    linha("Cliente: " + dados.cliente.nome + " | CPF/CNPJ: " + dados.cliente.documento);
    linha("Contato: " + dados.cliente.telefone + " | E-mail: " + dados.cliente.email);
    linha("Responsável Técnico: " + dados.rt.nome);
    linha("Registro Profissional: " + dados.rt.crea + " (" + dados.rt.uf + ") — " + dados.rt.registro);

    /* =================================
       3. GERADOR FOTOVOLTAICO (NARRATIVA + DADOS)
    ================================= */
    espaco(4);
    subtitulo("3. ARRANJO FOTOVOLTAICO E MÓDULOS");
    
    const narrativaModulos = `O arranjo fotovoltaico é composto por ${dados.sistema.quantidadeModulos} módulo(s) de alta eficiência do fabricante ${dados.sistema.fabricanteModulo}, modelo ${dados.sistema.modeloModulo}, com potência nominal unitária de ${dados.sistema.potenciaModulo}Wp. Isso resulta em uma potência total CC instalada de ${dados.calculos.potenciaDC} kWp. Os módulos serão interligados formando ${dados.sistema.quantidadeStrings} string(s) de ${dados.sistema.modulosPorString} módulos cada.`;
    paragrafo(narrativaModulos);

    linha("· Tensão em Circuito Aberto (Voc stc): " + dados.sistema.vocModulo + " V");
    linha("· Tensão de Máxima Potência (Vmp stc): " + dados.sistema.vmpModulo + " V");
    linha("· Corrente de Curtocircuito (Isc stc): " + dados.sistema.iscModulo + " A");
    linha("· Corrente de Máxima Potência (Imp stc): " + dados.sistema.impModulo + " A");
    linha("· Tensão Máxima da String (Voc total): " + dados.calculos.vocString);
    linha("· Tensão de Operação da String (Vmp total): " + dados.calculos.vmpString);

    /* =================================
       4. INVERSOR E CONVERSÃO (NARRATIVA + DADOS)
    ================================= */
    espaco(4);
    subtitulo("4. INVERSOR E PROCESSAMENTO DE ENERGIA");

    const narrativaInversor = `A conversão da energia em corrente contínua (CC) para corrente alternada (CA) será realizada por ${dados.sistema.quantidadeInversores} inversor(es) do fabricante ${dados.sistema.fabricanteInversor}, modelo ${dados.sistema.modeloInversor}, com potência nominal CA total de ${dados.calculos.potenciaAC} kW. O fator de dimensionamento entre a potência do arranjo CC e a potência CA do inversor (Fator Overloading / Ratio DC/AC) é de ${dados.calculos.ratioDCAC}.`;
    paragrafo(narrativaInversor);

    linha("· Tensão Máxima de Entrada CC do Inversor: " + dados.sistema.tensaoMaxEntrada + " V");
    linha("· Faixa de Operação MPPT: " + dados.sistema.mpptMin + " V a " + dados.sistema.mpptMax + " V");
    linha("· Corrente Máxima por MPPT: " + dados.sistema.correnteMaxMppt + " A");
    linha("· Entradas MPPT Utilizadas: " + dados.sistema.quantidadeMppt + " MPPT(s) com " + dados.sistema.stringsPorMppt + " string(s) por MPPT");

    /* =================================
       5. CONEXÃO À REDE (NARRATIVA)
    ================================= */
    espaco(4);
    subtitulo("5. PONTO DE CONEXÃO E REDE ELÉTRICA");

    const narrativaConexao = `O sistema será conectado no padrão de entrada da unidade consumidora sob o tipo de ligação ${formatarTipoConexao(dados.sistema.tipoLigacao)} (${dados.sistema.numeroFases} fase(s)) na tensão nominal de ${dados.sistema.tensaoNominal}V, em conformidade com as normas técnicas da distribuidora ${dados.sistema.distribuidora}.`;
    paragrafo(narrativaConexao);

    /* =================================
       6. PARECER TÉCNICO E VALIDAÇÃO (NARRATIVA DINÂMICA)
    ================================= */
    espaco(4);
    subtitulo("6. AVALIAÇÃO DE COMPATIBILIDADE E PARECER TÉCNICO");

    linha("Validação Estrutural/Elétrica: " + dados.validacao);

    const resultadoSanitizado = sanitizarTexto(dados.resultadoTecnico);
    const possuiErro = resultadoSanitizado.toUpperCase().includes("ATENÇÃO") || 
                       resultadoSanitizado.toUpperCase().includes("INCONSISTÊNCIAS") || 
                       resultadoSanitizado.toUpperCase().includes("INCOMPATÍVEL");

    let narrativaParecer = "";
    if (possuiErro) {
      narrativaParecer = `ATENÇÃO: Durante a análise automatizada dos limites elétricos, foram identificadas inconformidades nos parâmetros de tensão ou corrente do arranjo em relação aos limites do inversor. O projeto requer revisão técnica do dimensionamento antes da submissão à concessionária.`;
    } else {
      narrativaParecer = `CONCLUSÃO: O dimensionamento eletrotécnico do sistema fotovoltaico encontra-se totalmente compatível com os limites operacionais dos equipamentos especificados. As tensões de string e correntes operam dentro da janela MPPT do inversor, garantindo a segurança e o rendimento energético da instalação.`;
    }

    paragrafo(narrativaParecer);
    linha("Detalhamento Técnico: " + resultadoSanitizado, true);

    /* =================================
       7. OBSERVAÇÕES E NOTAS
    ================================= */
    espaco(4);
    subtitulo("7. OBSERVAÇÕES COMPLEMENTARES");
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
      pdf.text("HomologaSolar RT — Documento Gerado Automatizado", margem, 283);
      pdf.text("Página " + pagina + " de " + totalPaginas, 160, 283);
    }

    /* =================================
       SALVAR
    ================================= */
    const nomeArquivo =
      "Memorial_Descritivo_" +
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
     
