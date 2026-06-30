# 🎮 FPS 3D Game

Um jogo FPS 3D profissional e totalmente funcional desenvolvido com **Babylon.js**.

## 🎯 Features

✨ **Gráficos 3D de Alta Qualidade**
- Renderização com Babylon.js
- Iluminação e sombras realistas
- Ambiente dinâmico com estruturas

🎮 **Mecânicas de Gameplay**
- Sistema de movimento fluído (W/A/S/D)
- Câmera em primeira pessoa com controle de mouse
- Sistema de disparo e recarga
- Sistema de pulo e gravidade

🤖 **Inimigos com IA**
- Detecção de player
- Comportamento de perseguição
- Sistema de vida e dano
- Healthbar visual

📊 **Interface e Feedback**
- HUD em tempo real (Health, Ammo, Kills, Wave)
- Radar tático mostrando inimigos
- Menu principal intuitivo
- Sistema de pontuação

🌊 **Sistema de Waves**
- Dificuldade progressiva
- Mais inimigos a cada wave
- Inimigos mais fortes com o tempo

🔊 **Áudio**
- Efeitos sonoros gerados por Web Audio API
- Sons de disparo, acerto, recarga
- Feedback sonoro de eventos

## 🚀 Como Instalar e Executar

### Pré-requisitos
- Node.js 14+
- npm ou yarn

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/Jose-Henrique01/FPS-3d.git
cd FPS-3d

# Instalar dependências
npm install

# Executar em desenvolvimento
npm start

# Buildar para produção
npm run build
```

O jogo será aberto automaticamente em `http://localhost:8080`

## 🎮 Controles

| Tecla | Ação |
|-------|------|
| **W/A/S/D** | Mover |
| **Mouse** | Olhar ao redor |
| **Clique Esquerdo** | Atirar |
| **R** | Recarregar |
| **Espaço** | Pular |
| **ESC** | Menu/Pausa |

## 📁 Estrutura do Projeto

```
fps-3d-game/
├── src/
│   ├── game/
│   │   ├── Game.js          # Classe principal do jogo
│   │   ├── Scene.js         # Configuração do cenário
│   │   ├── Player.js        # Lógica do jogador
│   │   ├── Enemy.js         # Lógica dos inimigos
│   │   └── UI.js            # Sistema de UI
│   └── utils/
│       ├── InputManager.js  # Gerenciamento de entrada
│       └── SoundManager.js  # Sistema de áudio
├── public/
│   └── index.html           # Página HTML principal
├── webpack.config.js        # Configuração do Webpack
├── package.json             # Dependências do projeto
└── README.md                # Este arquivo
```

## 🎯 Gameplay

1. **Iniciar o Jogo**: Clique em "INICIAR JOGO"
2. **Destruir Inimigos**: Use o mouse para mirar e clique para atirar
3. **Sobreviver**: Evite os inimigos e destrua-os antes que cheguem até você
4. **Progresso**: Cada wave tem mais inimigos e eles são mais fortes
5. **Pontuação**: Ganhe pontos destruindo inimigos
6. **Game Over**: Quando sua saúde chegar a 0, o jogo termina

## 🛠️ Tecnologias Utilizadas

- **Babylon.js 6.0** - Engine 3D
- **Webpack 5** - Bundler
- **Babel** - Transpilador JavaScript
- **Web Audio API** - Geração de áudio
- **HTML5 / CSS3** - Interface

## 📈 Melhorias Futuras

- [ ] Múltiplos tipos de inimigos
- [ ] Sistema de power-ups
- [ ] Múltiplos mapas
- [ ] Modo multiplayer online
- [ ] Sistema de armas diferentes
- [ ] Chefes finais de wave
- [ ] Animações aprimoradas
- [ ] Partículas de efeito

## 🤝 Contribuindo

Sinta-se livre para fazer fork do projeto e enviar pull requests com melhorias!

## 📄 Licença

MIT - Veja LICENSE para mais detalhes

## 👨‍💻 Autor

**Jose-Henrique01** - Desenvolvedor do Jogo

---

### 🎮 Divirta-se jogando! 🎮

Se você gostou, deixe uma ⭐ no repositório!
