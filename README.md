# SultiAI - Bisaya Language & Communication Hub (Android)

An AI-powered Bisaya/Cebuano language-learning and communication Android platform for non-native speakers, built using Kotlin, Jetpack Compose, Material 3, and modern Android architecture.

## Overview

SultiAI was developed for non-native speakers, transferees, and learners in the Visayas and Mindanao regions of the Philippines. It integrates:
- **Curriculum & Interactive Lessons**: Module-based learning with flashcards, multiple-choice quizzes, sentence assembly, and pronunciation drills.
- **SULTI AI Conversational Companion**: Real-time conversational tutor providing culturally grounded responses in Bisaya (Cebuano, Davao Bisaya, and Boholano) with English translations, phonetic guides, and vocabulary breakdowns.
- **BERT-Based Intent Analysis**: mBERT-fine-tuned intent classifier determining learner communicative intent, sentiment, dialect markers, and token weights.
- **Whisper Speech-to-Text & Acoustic WER Analysis**: Speech evaluation against native Visayan acoustic patterns measuring Word Error Rate (WER) and syllable breakdowns.
- **Community Learning Hub**: Learner discussions, expressions, cultural tips, upvotes, and comments.
- **BSIT Capstone Research Instrument**: Empirical evaluation tracking System Usability Scale (SUS 88.5) and pre/post-test improvement (+77.8%).

## Tech Stack & Architecture

- **Language**: Kotlin 2.0+
- **UI Toolkit**: Jetpack Compose & Material 3 (M3)
- **Architecture**: MVVM with reactive StateFlow
- **Build System**: Gradle (Kotlin DSL)
- **Target SDK**: Android SDK 35 (Android 15), Min SDK 26 (Android 8.0)
- **Launcher Icon**: Custom Adaptive Icon with 66dp safe zone and multi-density PNG mipmaps

## Project Structure

```
├── app/
│   ├── build.gradle.kts
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── java/com/example/sultiai/
│       │   ├── MainActivity.kt
│       │   ├── data/
│       │   │   ├── Models.kt
│       │   │   ├── CurriculumData.kt
│       │   │   └── SultiAiEngine.kt
│       │   └── ui/
│       │       ├── theme/
│       │       ├── components/
│       │       ├── screens/
│       │       └── dialogs/
│       └── res/
│           ├── drawable/
│           ├── mipmap-*/
│           └── values/
├── gradle/libs.versions.toml
├── build.gradle.kts
└── settings.gradle.kts
```
