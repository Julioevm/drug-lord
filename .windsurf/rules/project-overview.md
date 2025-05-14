---
trigger: always_on
---

This is an Angular 19 Project.
We will use Standalone components by default, with SCSS styling.

We can use angularprimitives to leverage more complex components out of the box, like dialogs, toggles, or other UI elements.

The application is an SPA video game based on the basic Drug Wars game where you buys and sell drugs.

### Styling

Try to use variables and styles on styles folder and the main style.scss instead of duplicating values in scss files.


## Game Overview

### Screens

- Main Screen: A summary screen with the player info and the main actions.

- Market: Here the player can stock on drugs.

- Map: Here the player can select an are where to move, moving costs 1 TU.

- Dealing: This screens handles the player dealing drugs in the current area.

### Data

- game.models.ts: Holds most of the game data. Typescript types.