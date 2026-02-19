# GeoMestre Brasil

Jogo educativo web (pt-BR) para aprender **estados e capitais do Brasil** com mapa interativo, feedback pedagógico e progressão de dificuldade.

## Objetivo pedagógico
- Fixar associação estado ↔ capital com prática ativa.
- Reforçar memória com dicas mnemônicas curtas e revisão de erros.
- Permitir treino com e sem pressão (modo jogo e modo estudo).

## Como jogar
1. Clique em **Jogar**.
2. Veja no mapa o estado destacado.
3. Responda duas perguntas: **estado** e **capital**.
4. Ganhe pontos por acerto (estado + capital) e bônus por sequência.
5. O jogo termina ao atingir o limite de erros.

### Dificuldades
- **Fácil**: múltipla escolha.
- **Médio**: digitação assistida (autocomplete via datalist).
- **Difícil**: resposta livre com tolerância a acentos/maiúsculas.

### Modo estudo
- Clique no estado no mapa para ver estado/capital.
- Revisão em flashcards dos erros recentes.

## Arquitetura
- `src/data/statesData.js`: base centralizada de estados/capitais/dicas.
- `src/data/brazil-states.json`: mapa com estados individualizados (GeoJSON).
- `src/components/BrazilMap.jsx`: renderização SVG interativa do mapa.
- `src/utils/text.js`: normalização e comparação textual.
- `src/utils/validation.js`: validação e cálculo de pontuação.
- `src/utils/*.test.js`: testes de utilitários.

## Scripts
- `npm run dev`
- `npm run build`
- `npm run test`

## Mobile UX principles
Aplicado a partir de boas práticas de HIG/Material/MDN/WCAG e feedback de uso real em celular:

1. **Uma ação principal por vez**
   - Em partida ativa, a tela mostra principalmente **mapa + HUD compacto + CTA “Resposta”**.
   - Configurações e ações secundárias ficam fora da tela principal, em modal.

2. **Responder em contexto full-screen**
   - A resposta abre em um painel full-screen mobile-first com contexto da rodada (estado destacado).
   - Fluxo explícito: escolher resposta → **Confirmar**.
   - Rascunhos são preservados ao fechar o painel; **Cancelar** limpa o rascunho.

3. **Ergonomia de toque e legibilidade**
   - Alvos de toque com mínimo prático de ~44–48px.
   - Inputs, botões e opções com contraste forte e estado de foco/seleção visível.
   - Tamanhos de fonte de formulário em `16px` para evitar zoom automático no iOS ao focar campos.

4. **Sem scroll vertical durante gameplay**
   - Shell do jogo em `100dvh` com `safe-area` (`env(safe-area-inset-*)`) e `overflow` controlado.
   - A imersão fica no mapa e no painel de resposta, evitando layout quebrado por rolagem acidental.

5. **Zoom: prevenir acidentes sem quebrar acessibilidade**
   - Não usamos `user-scalable=no` por padrão, para preservar acessibilidade.
   - Reduzimos zoom acidental com layout touch-first, controles maiores e tipografia adequada.
   - Viewport inclui `viewport-fit=cover` e ajuste de teclado com `interactive-widget=resizes-content`.

## Design refresh
- Interface redesenhada com linguagem visual premium e minimalista inspirada em produtos Apple.
- Novo design system com escala de espaçamento, tipografia mais consistente, radii/sombras coesos e paleta neutra com um acento azul.
- Componentes modernizados: botões, campos, selects, chips de status, barra de progresso e cartões de revisão.
- Container do mapa refinado com destaque de estado mais elegante e transições suaves.
- Melhorias de acessibilidade: foco visível, contraste aprimorado, microinterações discretas e responsividade otimizada para larguras de iPhone.
- Suporte automático a dark mode via `prefers-color-scheme`.

## Próximos passos
- Adicionar áudio de pronúncia de estados/capitais.
- Implementar trilhas de aprendizagem por região.
- Salvar progresso e métricas de retenção por usuário.
