# Análise detalhada e roadmap do Graph

## Escopo e resultado dos testes

Revisei `index.html`, `css/style.css`, `js/script.js` e o README no clone separado `C:\Users\Lukazz\Desktop\Fast Tools-Graph-Test-Clone`. Também abri o app em navegador local a 1280 × 720 e rodei a suíte do clone com `npm test`.

O teste manual confirmou criação de datasets e categorias, edição de valores, renomeação e renderização de gráficos. Dados salvos continuam disponíveis após recarregar, embora a seleção do dataset e do gráfico volte ao estado inicial. Digitar `1.5` funciona; apagar o campo numérico salva zero.

Na exclusão de dataset, a tela muda para “Select a dataset”, mas mantém o gráfico com os dados apagados e o botão de configurações visível. Ao excluir o gráfico do meio em uma lista de três, criar outro produz dois itens chamados “Graph 3”. Criar um gráfico também não o seleciona automaticamente. Salvar um nome vazio mantém o modal aberto sem explicar o erro.

A suíte no clone tem **4 testes aprovados e 5 regressões marcadas como TODO**. O processo termina com código zero porque os casos TODO documentam defeitos conhecidos. Os testes executam o JavaScript real com um DOM e ApexCharts simulados; não substituem testes completos em navegadores reais. O clone está separado do checkout original.

## Prioridade 1 — integridade dos dados e estados incorretos

### 1. Limpar toda a interface ao excluir o dataset

O fluxo limpa títulos e lista de categorias, mas não limpa as séries nem as categorias do ApexCharts e não esconde o botão de configurações do dataset. A evidência manual mostra o valor antigo no gráfico sob o título “Select a dataset”.

**Pronto quando:** depois de excluir o dataset ativo, não restam dados, títulos ou controles referentes a ele; a tela fica equivalente ao estado inicial.

### 2. Não sobrescrever dados corrompidos sem recuperação

Quando o JSON salvo é inválido, o código registra um erro, usa uma lista vazia e chama a renderização inicial. Essa renderização grava `[]` em `localStorage`, substituindo o conteúdo anterior. O teste no clone confirmou `not-json` sendo trocado por `[]` durante a inicialização.

**Pronto quando:** o app preserva uma cópia do dado inválido, informa que não conseguiu carregá-lo e permite recuperar ou exportar o conteúdo antes de resetar.

### 3. Validar a estrutura carregada antes de renderizar

O código só verifica se o valor raiz é um array. JSON válido como `[null]` faz `renderDatasets()` falhar ao acessar `dataset.id`; objetos sem `graphs`, `categories` ou `series` também podem quebrar ao abrir ou editar o dataset. O teste no clone reproduziu o crash com `[null]`.

**Pronto quando:** registros incompletos são migrados, ignorados com aviso ou recuperados sem derrubar a página e sem apagar os dados originais.

### 4. Tratar indisponibilidade e erros de `localStorage`

Há gravações sem `try/catch`, inclusive durante a inicialização da página. Um erro de quota ou armazenamento bloqueado interrompe a renderização; a suíte reproduziu falha de startup quando `setItem` lança erro.

**Pronto quando:** falhas de leitura e gravação geram uma mensagem útil e o app continua utilizável enquanto a página estiver aberta.

## Prioridade 2 — funcionalidades e uso diário

### 5. Fazer a configuração de cada gráfico funcionar

O menu de tipos mostra “Coming soon..”. Cada registro salva `type: "bar"`, mas `updateChart()` não usa esse campo e o ApexCharts é criado sempre como barra. Hoje os gráficos do dataset compartilham as mesmas categorias e séries. Defina se essa partilha é intencional e permita configurar o tipo de visualização por gráfico.

**Pronto quando:** cada gráfico selecionado mostra a configuração salva, ou a interface deixa claro que os gráficos são apenas vistas nomeadas do mesmo conjunto de dados.

### 6. Corrigir nomes duplicados e selecionar o gráfico recém-criado

O nome novo é calculado por `graphs.length + 1`. Depois de apagar `Graph 2` da sequência `Graph 1`, `Graph 2`, `Graph 3`, o próximo item também recebe `Graph 3`. Além disso, `New graph` cria o item mas mantém “Select a graph” no painel.

**Pronto quando:** a criação escolhe um nome ainda livre e abre o gráfico novo imediatamente.

### 7. Alinhar edição de dataset e documentação

O README promete que datasets podem ser editados, mas o modal de configurações só mostra o nome e permite exclusão. Implemente a renomeação ou corrija a promessa na documentação.

### 8. Melhorar validação dos formulários

Os botões de salvar nome são `type="button"`; portanto `required` não aciona a validação nativa e Enter não envia o formulário. O código ignora texto vazio silenciosamente. Também não há decisão explícita sobre nomes repetidos.

**Pronto quando:** salvar vazio mostra um erro junto ao campo; Enter salva; e a regra para nomes duplicados é consistente.

### 9. Ajustar layout e acessibilidade

O CSS não tem breakpoints; a sidebar mede 250 px e o gráfico ocupa 85% do workspace. Isso cria risco de aperto ou rolagem horizontal em celular; não fiz uma medição real em viewport móvel. Dataset, gráfico e cabeçalhos expansíveis são `div`s clicáveis, sem semântica de botão. Campos de categoria/valor não têm rótulos associados, e botões de ícone não têm nomes acessíveis descritivos.

- Criar layout que empilhe ou recolha a sidebar em telas estreitas.
- Usar botões e controles expansíveis com estado acessível.
- Rotular campos e botões de editar/excluir.
- Validar foco, Tab, Enter/Espaço e leitor de tela.

### 10. Definir o comportamento de valores numéricos vazios

Valores decimais digitados são aceitos e aparecem no gráfico. Ao apagar o campo, `Number("")` salva zero. Decida se campo vazio significa zero ou dado ausente e deixe o comportamento visível; use `step="any"` se os controles de incremento também precisarem aceitar decimais.

## Prioridade 3 — evolução e manutenção

### 11. Oferecer backup e transferência do dataset

A barra do ApexCharts já permite baixar o gráfico como CSV, SVG e PNG. Adicione exportação/importação em JSON para preservar o dataset completo, incluindo categorias, valores e vários gráficos.

### 12. Suportar várias séries editáveis

O modelo e o ApexCharts aceitam uma lista de séries, mas a interface só edita `series[0]`. Se comparação entre métricas fizer parte do objetivo, adicione criação, renomeação e remoção de séries.

### 13. Completar a cobertura de testes

A suíte do clone já cobre criação, edição, persistência, JSON inválido, estrutura malformada, erro de storage, exclusão e nomes após exclusão. Manter esses casos como regressões e adicionar testes reais de navegador, teclado e viewports móveis. A suíte continua no clone; integrá-la ao checkout original deve ser uma decisão separada.

### 14. Reforçar estados e recursos auxiliares

- Restaurar a última seleção após recarregar, se isso fizer sentido para o fluxo.
- Informar quando não há gráficos ou categorias e quando uma gravação falha.
- Definir fallback se ApexCharts ou as fontes externas do CDN não carregarem; sem ApexCharts, o script atual não inicializa.
- Evitar serializar todo o dataset e atualizar o gráfico a cada tecla quando o volume de dados crescer.
- Remover regras CSS duplicadas e estilos de modais que não existem no HTML.
