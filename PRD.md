# Product Requirements Document: PolicyMate

## User Profile
**The User:** Our primary user is a middle-class Indian individual (e.g., a 45-year-old with pre-existing conditions like diabetes, earning between 3-8L annually in a Tier-2 city) who is selecting a health insurance policy for themselves and their family.
**Primary Pain Points & Fears:** 
- **Fear of Rejection/Hidden Clauses:** They fear that their pre-existing conditions will cause claims to be denied due to hidden "waiting periods" or "sub-limits" they didn't understand when purchasing.
- **Financial Anxiety:** They are anxious about out-of-pocket expenses (co-pays) that could ruin their savings despite having insurance.
- **Cognitive Overload:** Insurance documents are written in dense, clinical legalese. Users feel overwhelmed comparing multiple 50-page PDFs.

## Problem Statement
The current insurance buying experience in India relies on aggressive sales agents or simple comparison tables that rank policies by premium price alone. This leaves vulnerable patients making high-stakes financial decisions without understanding crucial medical caveats (like disease-specific waiting periods or room rent caps). 
**PolicyMate** solves this by putting the patient at the heart of the experience: using a grounded AI agent to translate complex policy PDFs into empathetic, personalised, and transparent recommendations based on their exact medical and financial reality.

## Feature Priority
Given the 2-day constraint, features were strictly prioritised to demonstrate empathetic logic and document intelligence over generic UI features.
1. **Grounded AI Recommendation Engine (P0):** The core value proposition. If the AI hallucinates, trust is broken. We prioritised building a strict RAG pipeline to source coverage details directly from PDFs.
2. **Interactive Policy Explainer Chat (P0):** Users need jargon (like "co-pay") explained in plain English, with realistic examples using their actual health conditions. Session memory is prioritised here to prevent the frustration of repeating themselves.
3. **Admin Knowledge Base Management (P1):** Essential for operational scalability, allowing non-technical staff to update policy rules without code deployments.
4. **User Auth/Dashboard (Out of Scope):** While useful for a production SaaS, enforcing user login adds friction to the demo and distracts from the core evaluation metric: the quality and empathy of the AI recommendation.

## Recommendation Logic
The recommendation algorithm bridges the user's 6-field profile to specific policy terms. The logic operates in two stages:
1. **Pre-Filtering & Retrieval:** We embed a composite string of the user's *Age, Income, City, and Conditions* to query the vector store (ChromaDB). This ensures we retrieve policy chunks that explicitly address their medical reality (e.g., retrieving diabetes waiting periods).
2. **AI Ranking & Empathy Layer:** The retrieved chunks are passed to the LLM along with strict grounding instructions. The LLM evaluates suitability based on:
   - **Conditions & Waiting Periods:** Policies with shorter waiting periods for the user's specific pre-existing conditions are scored higher.
   - **Income & Premium/Co-Pay:** Users in lower income bands (under 3L) are matched with policies having low co-pay percentages to minimize point-of-care financial shocks.
   - **Age & Cover Amount:** Older users are matched with higher cover amounts and comprehensive inpatient inclusions.

## Assumptions
- **Data Availability:** We assume that uploaded policy PDFs contain explicitly structured sections for Inclusions, Exclusions, and Waiting Periods that standard chunking can reliably isolate.
- **User Truthfulness:** We assume users accurately disclose pre-existing conditions. In production, an underwriting integration would verify this.
- **Domain Scope:** The current vector database is scoped to health insurance. It assumes policies are priced flatly or that the exact premium tables are included in the uploaded documents.
