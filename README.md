# Sentimentum — Analizador léxico-emocional
[![CI - Next.js](https://github.com/Justmonado/Sentimentum/actions/workflows/ci.yml/badge.svg?branch=develop&event=push)](https://github.com/Justmonado/Sentimentum/actions/workflows/ci.yml)

Análisis de sentimiento en **español (México)** con motor léxico local. Funciona **sin API externa**: todo el procesamiento ocurre en tu navegador.


## Cómo funciona el análisis

1. Normaliza y tokeniza el texto.
2. Segmenta por conectores de contraste (`pero`, `aunque`, `sin embargo`).
3. En cada cláusula: frases emocionales → bigramas → palabras con pesos.
4. Ventana de negación de 3 tokens tras `no`, `nunca`, etc.
5. Normaliza scores y calcula emoción predominante + confianza.
6. Genera resumen explicable (incluye si hubo segmentación por contraste).

## Nota ética

Los resultados son **indicadores de apoyo**, no diagnóstico clínico. Si aparece una alerta de riesgo, usa los recursos de crisis en la interfaz.
