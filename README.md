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
