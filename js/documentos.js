/* =========================================
   HOMOLOGASOLAR RT
   MOTOR DE DOCUMENTOS
   ========================================= */


/* =========================================
   FUNÇÕES AUXILIARES
========================================= */

function documentoTexto(id, padrao = "—") {

  const elemento =
    document.getElementById(id);

  if (!elemento) {
    return padrao;
  }

  const texto =
    elemento.textContent ||
    elemento.value ||
    "";

  return texto.trim() || padrao;

}


function documentoValor(valor, padrao = "—") {

  if (
    valor === null ||
    valor === undefined ||
    valor === ""
  ) {
    return padrao;
  }

  return valor;

}


/* =========================================
   OBTER DADOS DO PROJETO
========================================= */

function obterDadosDocumento() {

  if (
    typeof sistemaAtual === "undefined" ||
    !sistemaAtual
  ) {

    throw new Error(
      "Salve o sistema fotovoltaico antes de gerar o documento."
    );

  }


  return {

    projeto:
      documentoTexto(
        "nomeProjeto"
      ),

    status:
      documentoTexto(
        "statusProjeto"
      ),


    cliente: {

      nome:
        documentoTexto(
          "clienteNome"
        ),

      documento:
        documentoTexto(
          "clienteDocumento"
        ),

      telefone:
        documentoTexto(
          "clienteTelefone"
        ),

      email:
        documentoTexto(
          "clienteEmail"
        )

    },


    rt: {

      nome:
        documentoTexto(
          "rtNome"
        ),

      crea:
        documentoTexto(
          "rtCrea"
        ),

      uf:
        documentoTexto(
          "rtUf"
        ),

      registro:
        documentoTexto(
          "rtRegistro"
        )

    },


    sistema: {

      fabricanteModulo:
        documentoValor(
          sistemaAtual.fabricante_modulo
        ),

      modeloModulo:
        documentoValor(
          sistemaAtual.modelo_modulo
        ),

      potenciaModulo:
        documentoValor(
          sistemaAtual.potencia_modulo_w
        ),

      quantidadeModulos:
        documentoValor(
          sistemaAtual.quantidade_modulos
        ),

      vocModulo:
        documentoValor(
          sistemaAtual.voc_modulo
        ),

      vmpModulo:
        documentoValor(
          sistemaAtual.vmp_modulo
        ),

      iscModulo:
        documentoValor(
          sistemaAtual.isc_modulo
        ),

      impModulo:
        documentoValor(
          sistemaAtual.imp_modulo
        ),


      quantidadeStrings:
        documentoValor(
          sistemaAtual.quantidade_strings
        ),

      modulosPorString:
        documentoValor(
          sistemaAtual.modulos_por_string
        ),

      quantidadeMppt:
        documentoValor(
          sistemaAtual.quantidade_mppt
        ),

      stringsPorMppt:
        documentoValor(
          sistemaAtual.strings_por_mppt
        ),


      fabricanteInversor:
        documentoValor(
          sistemaAtual.fabricante_inversor
        ),

      modeloInversor:
        documentoValor(
          sistemaAtual.modelo_inversor
        ),

      potenciaInversor:
        documentoValor(
          sistemaAtual.potencia_inversor_kw
        ),

      quantidadeInversores:
        documentoValor(
          sistemaAtual.quantidade_inversores
        ),


      tensaoMaxEntrada:
        documentoValor(
          sistemaAtual.tensao_max_entrada_v
        ),

      mpptMin:
        documentoValor(
          sistemaAtual.tensao_mppt_min_v
        ),

      mpptMax:
        documentoValor(
          sistemaAtual.tensao_mppt_max_v
        ),

      correnteMaxMppt:
        documentoValor(
          sistemaAtual.corrente_max_mppt_a
        ),


      distribuidora:
        documentoValor(
          sistemaAtual.distribuidora
        ),

      tipoLigacao:
        documentoValor(
          sistemaAtual.tipo_ligacao
        ),

      numeroFases:
        documentoValor(
          sistemaAtual.numero_fases
        ),

      tensaoNominal:
        documentoValor(
          sistemaAtual.tensao_nominal
        ),

      observacoes:
        documentoValor(
          sistemaAtual.observacoes,
          "Nenhuma observação registrada."
        )

    },


    calculos: {

      potenciaDC:
        documentoTexto(
          "potenciaDC"
        ),

      potenciaAC:
        documentoTexto(
          "potenciaAC"
        ),

      ratioDCAC:
        documentoTexto(
          "ratioDCAC"
        ),

      potenciaString:
        documentoTexto(
          "potenciaString"
        ),

      vmpString:
        documentoTexto(
          "vmpString"
        ),

      vocString:
        documentoTexto(
          "vocString"
        ),

      correnteString:
        documentoTexto(
          "correnteString"
        )

    },


    validacao:
      documentoTexto(
        "validacaoDimensionamento"
      ),

    resultadoTecnico:
      documentoTexto(
        "resultadoTecnico"
      )

  };

}


/* =========================================
   GERAR MEMORIAL DESCRITIVO
========================================= */

async function gerarMemorialDescritivoPDF() {

  try {

    const dados =
      obterDadosDocumento();


    if (
      typeof window.jspdf === "undefined"
    ) {

      throw new Error(
        "Biblioteca PDF não carregada."
      );

    }


    const {
      jsPDF
    } = window.jspdf;


    const pdf =
      new jsPDF(
        "p",
        "mm",
        "a4"
      );


    const margem = 20;
    const largura = 170;

    let y = 20;


    /* =================================
       FUNÇÕES DO DOCUMENTO
    ================================= */

    function verificarPagina(
      altura = 10
    ) {

      if (
        y + altura > 275
      ) {

        pdf.addPage();

        y = 20;

      }

    }


    function titulo(
      texto
    ) {

      verificarPagina(15);

      pdf.setFontSize(16);

      pdf.setFont(
        undefined,
        "bold"
      );

      pdf.text(
        texto,
        margem,
        y
      );

      y += 10;

    }


    function subtitulo(
      texto
    ) {

      verificarPagina(12);

      pdf.setFontSize(12);

      pdf.setFont(
        undefined,
        "bold"
      );

      pdf.text(
        texto,
        margem,
        y
      );

      y += 7;

    }


    function linha(
      texto
    ) {

      pdf.setFontSize(10);

      pdf.setFont(
        undefined,
        "normal"
      );

      const linhas =
        pdf.splitTextToSize(
          String(texto),
          largura
        );

      verificarPagina(
        (linhas.length * 5) + 5
      );

      pdf.text(
        linhas,
        margem,
        y
      );

      y +=
        (linhas.length * 5) + 3;

    }


    function espaco(
      tamanho = 5
    ) {

      y += tamanho;

    }


    /* =================================
       CAPA / IDENTIFICAÇÃO
    ================================= */

    titulo(
      "HOMOLOGASOLAR RT"
    );

    subtitulo(
      "MEMORIAL DESCRITIVO"
    );

    espaco(4);

    linha(
      "Projeto: " +
      dados.projeto
    );

    linha(
      "Status: " +
      dados.status
    );


    /* =================================
       1. IDENTIFICAÇÃO DO CLIENTE
    ================================= */

    espaco(5);

    subtitulo(
      "1. IDENTIFICAÇÃO DO CLIENTE"
    );

    linha(
      "Nome: " +
      dados.cliente.nome
    );

    linha(
      "CPF / CNPJ: " +
      dados.cliente.documento
    );

    linha(
      "Telefone: " +
      dados.cliente.telefone
    );

    linha(
      "E-mail: " +
      dados.cliente.email
    );


    /* =================================
       2. RESPONSÁVEL TÉCNICO
    ================================= */

    espaco(5);

    subtitulo(
      "2. RESPONSÁVEL TÉCNICO"
    );

    linha(
      "Nome: " +
      dados.rt.nome
    );

    linha(
      "CREA: " +
      dados.rt.crea
    );

    linha(
      "UF CREA: " +
      dados.rt.uf
    );

    linha(
      "Registro profissional: " +
      dados.rt.registro
    );


    /* =================================
       3. CARACTERÍSTICAS DO SISTEMA
    ================================= */

    espaco(5);

    subtitulo(
      "3. CARACTERÍSTICAS DO SISTEMA FOTOVOLTAICO"
    );

    linha(
      "Fabricante dos módulos: " +
      dados.sistema.fabricanteModulo
    );

    linha(
      "Modelo dos módulos: " +
      dados.sistema.modeloModulo
    );

    linha(
      "Potência unitária: " +
      dados.sistema.potenciaModulo +
      " W"
    );

    linha(
      "Quantidade de módulos: " +
      dados.sistema.quantidadeModulos
    );

    linha(
      "Potência DC instalada: " +
      dados.calculos.potenciaDC
    );


    /* =================================
       4. DADOS ELÉTRICOS DOS MÓDULOS
    ================================= */

    espaco(5);

    subtitulo(
      "4. DADOS ELÉTRICOS DOS MÓDULOS"
    );

    linha(
      "Voc: " +
      dados.sistema.vocModulo +
      " V"
    );

    linha(
      "Vmp: " +
      dados.sistema.vmpModulo +
      " V"
    );

    linha(
      "Isc: " +
      dados.sistema.iscModulo +
      " A"
    );

    linha(
      "Imp: " +
      dados.sistema.impModulo +
      " A"
    );


    /* =================================
       5. CONFIGURAÇÃO DAS STRINGS
    ================================= */

    espaco(5);

    subtitulo(
      "5. CONFIGURAÇÃO DAS STRINGS E MPPT"
    );

    linha(
      "Quantidade de strings: " +
      dados.sistema.quantidadeStrings
    );

    linha(
      "Módulos por string: " +
      dados.sistema.modulosPorString
    );

    linha(
      "Quantidade de MPPTs: " +
      dados.sistema.quantidadeMppt
    );

    linha(
      "Strings por MPPT: " +
      dados.sistema.stringsPorMppt
    );

    linha(
      "Potência por string: " +
      dados.calculos.potenciaString
    );

    linha(
      "Vmp da string: " +
      dados.calculos.vmpString
    );

    linha(
      "Voc da string: " +
      dados.calculos.vocString
    );

    linha(
      "Corrente por string: " +
      dados.calculos.correnteString
    );


    /* =================================
       6. INVERSOR
    ================================= */

    espaco(5);

    subtitulo(
      "6. INVERSOR"
    );

    linha(
      "Fabricante: " +
      dados.sistema.fabricanteInversor
    );

    linha(
      "Modelo: " +
      dados.sistema.modeloInversor
    );

    linha(
      "Potência nominal: " +
      dados.sistema.potenciaInversor +
      " kW"
    );

    linha(
      "Quantidade: " +
      dados.sistema.quantidadeInversores
    );

    linha(
      "Potência AC: " +
      dados.calculos.potenciaAC
    );

    linha(
      "Ratio DC/AC: " +
      dados.calculos.ratioDCAC
    );


    /* =================================
       7. LIMITES ELÉTRICOS
    ================================= */

    espaco(5);

    subtitulo(
      "7. LIMITES ELÉTRICOS DO INVERSOR"
    );

    linha(
      "Tensão máxima de entrada: " +
      dados.sistema.tensaoMaxEntrada +
      " V"
    );

    linha(
      "Faixa MPPT: " +
      dados.sistema.mpptMin +
      " a " +
      dados.sistema.mpptMax +
      " V"
    );

    linha(
      "Corrente máxima por MPPT: " +
      dados.sistema.correnteMaxMppt +
      " A"
    );


    /* =================================
       8. CONEXÃO
    ================================= */

    espaco(5);

    subtitulo(
      "8. CONEXÃO ELÉTRICA"
    );

    linha(
      "Distribuidora: " +
      dados.sistema.distribuidora
    );

    linha(
      "Tipo de ligação: " +
      dados.sistema.tipoLigacao
    );

    linha(
      "Número de fases: " +
      dados.sistema.numeroFases
    );

    linha(
      "Tensão nominal: " +
      dados.sistema.tensaoNominal +
      " V"
    );


    /* =================================
       9. ANÁLISE TÉCNICA
    ================================= */

    espaco(5);

    subtitulo(
      "9. ANÁLISE TÉCNICA"
    );

    linha(
      "Validação estrutural: " +
      dados.validacao
    );

    linha(
      "Resultado técnico: " +
      dados.resultadoTecnico
    );


    /* =================================
       10. OBSERVAÇÕES
    ================================= */

    espaco(5);

    subtitulo(
      "10. OBSERVAÇÕES TÉCNICAS"
    );

    linha(
      dados.sistema.observacoes
    );


    /* =================================
       RODAPÉ
    ================================= */

    const totalPaginas =
      pdf.internal.getNumberOfPages();


    for (
      let pagina = 1;
      pagina <= totalPaginas;
      pagina++
    ) {

      pdf.setPage(
        pagina
      );

      pdf.setFontSize(
        8
      );

      pdf.setFont(
        undefined,
        "normal"
      );

      pdf.text(
        "HomologaSolar RT",
        margem,
        290
      );

      pdf.text(
        "Página " +
        pagina +
        " de " +
        totalPaginas,
        150,
        290
      );

    }


    /* =================================
       SALVAR
    ================================= */

    const nomeArquivo =
      "Memorial_Descritivo_" +
      (
        dados.projeto
          .replace(
            /[^a-zA-Z0-9À-ÿ _-]/g,
            ""
          )
          .replace(
            /\s+/g,
            "_"
          )
          .substring(
            0,
            60
          )
      ) +
      ".pdf";


    pdf.save(
      nomeArquivo
    );


  }

  catch (erro) {

    console.error(
      "Erro ao gerar Memorial Descritivo:",
      erro
    );

    alert(
      "❌ Não foi possível gerar o Memorial Descritivo.\n\n" +
      erro.message
    );

  }

      }
