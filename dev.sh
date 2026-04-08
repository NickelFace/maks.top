#!/bin/bash
hugo && npx pagefind --site public && hugo server --disableFastRender
