/* =========================================
   HOMOLOGASOLAR RT
   MOTOR DE DOCUMENTOS (jsPDF)
   ========================================= */

/* =========================================
   FUNÇÕES AUXILIARES DE TRATAMENTO DE TEXTO
========================================= */

function sanitizarTexto(texto) {
  if (texto === null || texto === undefined) return "";
  return String(texto)
    .replace(/&p|⚠️|❌|✔/g, "") // Remove artefatos de ícones e formatação da tela
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
   OBTER DADOS DO PROJETO (MANTIDO INTACTO)
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

    if (typeof window.jspdf === "undefined") {
      throw new Error("Biblioteca PDF não carregada.");
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");

    const margem = 20;
    const largura = 170;
    let y = 20;

    /* =================================
       FUNÇÕES DO DOCUMENTO E ESTILOS
    ================================= */

    function verificarPagina(altura = 10) {
      if (y + altura > 270) {
        pdf.addPage();
        y = 25;
      }
    }

    function titulo(texto) {
      verificarPagina(15);
      pdf.setFontSize(16);
      pdf.setFont(undefined, "bold");
      pdf.setTextColor(26, 82, 118); // Azul Corporativo Engenharia
      pdf.text(sanitizarTexto(texto), margem, y);
      y += 8;
    }

    function subtitulo(texto) {
      verificarPagina(12);
      pdf.setFontSize(11);
      pdf.setFont(undefined, "bold");
      pdf.setTextColor(41, 128, 185); // Azul Secundário
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

    function espaco(tamanho = 4) {
      y += tamanho;
    }

    /* =================================
       CAPA / CABEÇALHO TÉCNICO
    ================================= */

    titulo("HOMOLOGASOLAR RT");
    subtitulo("MEMORIAL DESCRITIVO DE MICROGERAÇÃO FOTOVOLTAICA");

    // Linha divisória do cabeçalho
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.4);
    pdf.line(margem, y, margem + largura, y);
    espaco(5);

    linha("Projeto: " + dados.projeto, true);
    linha("Status: " + dados.status);

    /* =================================
       1. IDENTIFICAÇÃO DO CLIENTE
    ================================= */

    espaco(4);
    subtitulo("1. IDENTIFICAÇÃO DO CLIENTE");
    linha("Nome: " + dados.cliente.nome);
    linha("CPF / CNPJ: " + dados.cliente.documento);
    linha("Telefone: " + dados.cliente.telefone);
    linha("E-mail: " + dados.cliente.email);

    /* =================================
       2. RESPONSÁVEL TÉCNICO
    ================================= */

    espaco(4);
    subtitulo("2. RESPONSÁVEL TÉCNICO");
    linha("Nome: " + dados.rt.nome);
    linha("CREA / CFT: " + dados.rt.crea);
    linha("UF CREA: " + dados.rt.uf);
    linha("Registro profissional: " + dados.rt.registro);

    /* =================================
       3. CARACTERÍSTICAS DO SISTEMA
    ================================= */

    espaco(4);
    subtitulo("3. CARACTERÍSTICAS DO SISTEMA FOTOVOLTAICO");
    linha("Fabricante dos módulos: " + dados.sistema.fabricanteModulo);
    linha("Modelo dos módulos: " + dados.sistema.modeloModulo);
    linha("Potência unitária: " + dados.sistema.potenciaModulo + " W");
    linha("Quantidade de módulos: " + dados.sistema.quantidadeModulos);
    linha("Potência DC instalada: " + dados.calculos.potenciaDC);

    /* =================================
       4. DADOS ELÉTRICOS DOS MÓDULOS
    ================================= */

    espaco(4);
    subtitulo("4. DADOS ELÉTRICOS DOS MÓDULOS");
    linha("Voc: " + dados.sistema.vocModulo + " V");
    linha("Vmp: " + dados.sistema.vmpModulo + " V");
    linha("Isc: " + dados.sistema.iscModulo + " A");
    linha("Imp: " + dados.sistema.impModulo + " A");

    /* =================================
       5. CONFIGURAÇÃO DAS STRINGS
    ================================= */

    espaco(4);
    subtitulo("5. CONFIGURAÇÃO DAS STRINGS E MPPT");
    linha("Quantidade de strings: " + dados.sistema.quantidadeStrings);
    linha("Módulos por string: " + dados.sistema.modulosPorString);
    linha("Quantidade de MPPTs: " + dados.sistema.quantidadeMppt);
    linha("Strings por MPPT: " + dados.sistema.stringsPorMppt);
    linha("Potência por string: " + dados.calculos.potenciaString);
    linha("Vmp da string: " + dados.calculos.vmpString);
    linha("Voc da string: " + dados.calculos.vocString);
    linha("Corrente por string: " + dados.calculos.correnteString);

    /* =================================
       6. INVERSOR
    ================================= */

    espaco(4);
    subtitulo("6. INVERSOR");
    linha("Fabricante: " + dados.sistema.fabricanteInversor);
    linha("Modelo: " + dados.sistema.modeloInversor);
    linha("Potência nominal: " + dados.sistema.potenciaInversor + " kW");
    linha("Quantidade: " + dados.sistema.quantidadeInversores);
    linha("Potência AC: " + dados.calculos.potenciaAC);
    linha("Ratio DC/AC: " + dados.calculos.ratioDCAC);

    /* =================================
       7. LIMITES ELÉTRICOS
    ================================= */

    espaco(4);
    subtitulo("7. LIMITES ELÉTRICOS DO INVERSOR");
    linha("Tensão máxima de entrada: " + dados.sistema.tensaoMaxEntrada + " V");
    linha("Faixa MPPT: " + dados.sistema.mpptMin + " a " + dados.sistema.mpptMax + " V");
    linha("Corrente máxima por MPPT: " + dados.sistema.correnteMaxMppt + " A");

    /* =================================
       8. CONEXÃO ELÉTRICA
    ================================= */

    espaco(4);
    subtitulo("8. CONEXÃO ELÉTRICA");
    linha("Distribuidora: " + dados.sistema.distribuidora);
    linha("Tipo de ligação: " + formatarTipoConexao(dados.sistema.tipoLigacao));
    linha("Número de fases: " + dados.sistema.numeroFases);
    linha("Tensão nominal: " + dados.sistema.tensaoNominal + " V");

    /* =================================
       9. ANÁLISE TÉCNICA
    ================================= */

    espaco(4);
    subtitulo("9. ANÁLISE TÉCNICA E VALIDAÇÃO");
    linha("Validação estrutural: " + dados.validacao);

    // Destacar o resultado técnico em bloco visual
    const resultadoSanitizado = sanitizarTexto(dados.resultadoTecnico);
    const possuiErro = resultadoSanitizado.toUpperCase().includes("ATENÇÃO") || resultadoSanitizado.toUpperCase().includes("INCONSISTÊNCIAS") || resultadoSanitizado.toUpperCase().includes("INCOMPATÍVEL");

    pdf.setFontSize(9.5);
    pdf.setFont(undefined, "bold");
    if (possuiErro) {
      pdf.setTextColor(192, 57, 43); // Vermelho para Erro
    } else {
      pdf.setTextColor(39, 174, 96); // Verde para Aprovado
    }
    
    linha("Resultado técnico: " + resultadoSanitizado, true);

    /* =================================
       10. OBSERVAÇÕES
    ================================= */

    espaco(4);
    subtitulo("10. OBSERVAÇÕES TÉCNICAS");
    linha(dados.sistema.observacoes);

    /* =================================
       RODAPÉ E MOLDURA DE PÁGINAS
    ================================= */

    const totalPaginas = pdf.internal.getNumberOfPages();

    for (let pagina = 1; pagina <= totalPaginas; pagina++) {
      pdf.setPage(pagina);

      // Moldura técnica de borda em todas as páginas
      pdf.setDrawColor(210, 210, 210);
      pdf.setLineWidth(0.3);
      pdf.rect(10, 10, 190, 277);

      // Rodapé
      pdf.setFontSize(8);
      pdf.setFont(undefined, "normal");
      pdf.setTextColor(120, 120, 120);
      pdf.text("HomologaSolar RT — Sistema de Homologação", margem, 283);
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
      
