# Roadmap do Graph

## Resultado do teste manual

Testei a página em um servidor local no caminho de implantação (`/tools/graph/index.html`). Consegui criar um dataset, adicionar categorias e valores, renomear uma categoria e um gráfico, criar um segundo gráfico e conferir que categorias e valores continuam salvos após atualizar a página.

Encontrei um defeito ao excluir o dataset de teste: a interface volta para “Select a dataset”, mas o gráfico ainda mostra os valores e categorias apagados, e o botão de configurações do dataset continua visível. O dataset criado só para o teste foi removido; nenhum dado preexistente foi alterado.

Não há testes automatizados no projeto. Os fluxos de exclusão de categoria e gráfico ainda precisam de validação própria.

## P1 — Corrigir primeiro

### 1. Limpar a tela ao excluir o dataset

No tratamento de exclusão, limpar a série e as categorias do gráfico, remover a lista de categorias e esconder os dois botões de configuração. Hoje o gráfico antigo continua visível e o botão do dataset sobrevive à exclusão.

**Pronto quando:** excluir o último dataset deixa a tela no mesmo estado limpo de uma primeira visita, sem dados antigos, controles ativos ou título selecionado.

### 2. Fazer cada gráfico respeitar sua configuração

O menu de tipos só mostra “Coming soon..”. O objeto do gráfico já armazena `type`, mas a renderização inicializa sempre como barras e não usa esse valor. Implementar a escolha de tipo e aplicá-la ao selecionar cada gráfico. Se os dados devem ser independentes por gráfico, mover as séries para o objeto do gráfico; se forem compartilhados pelo dataset, deixar essa relação explícita na interface.

**Pronto quando:** dois gráficos do mesmo dataset podem ter as configurações anunciadas e a seleção realmente atualiza o gráfico.

### 3. Implementar a edição do nome do dataset ou corrigir a documentação

O README diz que datasets podem ser editados, mas as configurações atuais só permitem excluir. Adicionar edição do nome com salvamento, ou ajustar o README para descrever apenas o que existe.

## P2 — Melhorias importantes

### 4. Adaptar a interface para telas pequenas e teclado

O layout usa uma sidebar fixa de 250 px ao lado de um gráfico largo e não define breakpoints. Em telas estreitas isso tende a comprimir ou estourar o conteúdo. Datasets, gráficos e cabeçalhos expansíveis também dependem de `div` clicável, e os botões de ícone não têm nomes acessíveis claros.

- Empilhar ou recolher a sidebar em telas estreitas e manter o gráfico utilizável.
- Usar botões para itens clicáveis e controles expansíveis, com `aria-expanded`.
- Adicionar `aria-label` aos botões de editar e excluir e rótulos associados aos campos de valor.
- Validar navegação por Tab, ativação por Enter/Espaço e foco visível.

### 5. Proteger os dados locais e oferecer backup

O app confia que o conteúdo de `localStorage` tem o formato esperado. Um JSON válido, mas incompleto ou antigo, pode quebrar a renderização; falhas de leitura, gravação ou quota também não são apresentadas ao usuário.

- Validar e normalizar datasets carregados antes de renderizar.
- Tratar falhas de leitura/gravação com uma mensagem recuperável.
- Versionar o formato salvo e definir migrações para mudanças futuras.
- Adicionar exportação e importação de dataset em JSON para backup e transferência entre navegadores.

### 6. Melhorar validação e edição de valores

Os botões de salvar nomes são `type="button"`, então `required` não aciona a validação nativa nem Enter envia o formulário. Os nomes também podem ficar duplicados. O campo numérico usa o passo padrão de inteiro.

- Usar formulários com submissão por Enter e mensagens de validação claras.
- Impedir nomes vazios após remover espaços e decidir se nomes repetidos são permitidos.
- Definir o comportamento para valores decimais, negativos e campos vazios; usar `step="any"` se decimais forem aceitos.

### 7. Evitar nomes repetidos ao recriar gráficos

O próximo nome é calculado como `quantidade de gráficos + 1`. Depois de uma exclusão, isso pode reutilizar um nome que ainda está em uso.

**Pronto quando:** criar gráficos após excluir qualquer gráfico gera um nome livre e previsível.

### 8. Permitir mais de uma série de dados

O modelo e o ApexCharts aceitam várias séries, mas a interface só cria e edita `series[0]`. Adicionar controles para criar, renomear e remover séries caso o objetivo seja comparar várias métricas no mesmo gráfico.

### 9. Selecionar o gráfico recém-criado

“New graph” cria o item, mas não o abre. Selecionar o novo gráfico automaticamente reduz um passo e confirma que ele foi criado.

## P3 — Acabamento e manutenção

### 10. Criar uma rotina de regressão

Adicionar testes para criação, edição, exclusão, valores inválidos, dados corrompidos no armazenamento, persistência após atualização e layout estreito. O teste de exclusão de dataset deve verificar que o gráfico e os controles somem.

### 11. Revisar dependências e recursos externos

ApexCharts, Google Fonts e Material Symbols vêm de CDNs. Definir o comportamento quando a rede ou um CDN não estiver disponível e manter as versões de dependência controladas.

### 12. Polir textos e estados vazios

Revisar os textos do README e da interface, explicar que o armazenamento é local e adicionar estados vazios para datasets sem gráficos e datasets sem categorias. Mostrar feedback quando salvar ou importar dados falhar.
