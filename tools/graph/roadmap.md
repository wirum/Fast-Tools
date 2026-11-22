# Roadmap do Graph

## Estado atual

Cada gráfico tem suas próprias `categories` e `series`, e o dataset funciona só como contêiner de gráficos. O tipo do gráfico (bar, line, area) é configurável e salvo por gráfico. Não há migração de dados antigos: dados em formato antigo geram o modal "Data error" e o usuário pode exportar ou resetar.

## Concluído

- **Independência dos gráficos:** `categories` e `series` movidas para dentro de cada gráfico; validação, criação, edição e remoção de categorias adaptadas.
- **Item 6, tipo de gráfico:** seletor no menu Chart Types, salvo em `graph.type`, validado por lista (`allowedChartTypes`), com `stroke` ajustado ao tipo.
- **Item 9, validação dos formulários (parcial):** salvar nome vazio mostra erro junto ao campo e Enter salva nos 3 modais de renomear. Nomes de gráfico novos nunca se repetem (menor número livre).
- **Item 11, valores numéricos:** campo vazio significa `0` (decisão tomada) e os campos aceitam decimais (`step="any"`).
- **Item 12, backup:** exportar e importar dataset em JSON.
- **Item 15, fallback do ApexCharts:** se a biblioteca não carregar, o app avisa com o modal "Chart unavailable" e continua utilizável.
- **Bugs de estado corrigidos:** excluir dataset limpa o gráfico; criar gráfico já o seleciona; a validação confere se `series[].data` tem o mesmo tamanho de `categories`.

## Prioridade 1 — integridade dos dados

### 9. Nomes duplicados ao renomear (restante)

Novos gráficos não repetem nome, mas renomear ainda permite duplicar (gráficos, datasets e categorias). Definir a regra e aplicá-la nos 3 modais.

**Pronto quando:** a regra de nomes repetidos é a mesma em todos os lugares e o erro aparece junto ao campo.

### 4. Recuperação automática de dados inválidos (adiado para V3)

Adiado de propósito: contradiz a decisão de não migrar dados antigos, e o projeto não tem usuários dependendo do formato anterior. Reavaliar só se surgirem dados reais a preservar. Se for feito, tratar o alinhamento entre `series[].data` e `categories` ao preencher campos ausentes.

## Prioridade 2 — interface

### 10. Layout e acessibilidade

- O CSS não tem breakpoints; a sidebar mede 250 px e o gráfico ocupa 85% do workspace. Medir em viewport móvel e criar layout que empilhe ou recolha a sidebar.
- Dataset, gráfico e cabeçalhos expansíveis são `div`s clicáveis; trocar por botões com estado acessível.
- Campos de categoria/valor não têm rótulos associados, e botões de ícone (editar, excluir, configurações) não têm nomes acessíveis.
- Validar foco, Tab, Enter/Espaço e leitor de tela.

## Prioridade 3 — evolução e manutenção

### 13. Várias séries editáveis (próximo)

O modelo e o ApexCharts aceitam várias séries, mas a interface só edita `series[0]`. Adicionar criar, renomear e remover séries, e escolher qual série está sendo editada. Garantir que toda série nova nasça com `data` do tamanho das categorias.

### 14. Cobertura de testes

Criar testes para criação, edição, persistência, JSON inválido, estrutura malformada, erro de storage, exclusão, nomes únicos e troca de tipo. Adicionar testes reais de navegador, teclado e viewports móveis.

### 15. Estados e recursos auxiliares (restante)

- Definir fallback para as fontes externas do CDN (Material Symbols).
- Evitar serializar todo o dataset a cada tecla quando o volume de dados crescer (salvar com debounce).
- Remover regras CSS duplicadas e estilos de modais que não existem no HTML.