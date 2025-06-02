import random
import math
from typing import List, Dict, Any

POPULATION_SIZE = 50
GENERATIONS     = 100
ELITE_COUNT     = 5
TOURNAMENT_SIZE = 3
CROSSOVER_RATE  = 0.8
MUTATION_RATE   = 0.1

WEIGHTS = {
    'price':   0.30,
    'rating':  0.30,
    'age':     0.1,
    'section': 0.30
}

MAX_AGE_DIFF = 30

CURRENCY_RATES = {
    'USD': 42.8,
    'EUR': 47.5,
    'UAH': 1.0
}


def normalize(value: float, min_v: float, max_v: float) -> float:
    if max_v == min_v:
        return 1.0
    return (value - min_v) / (max_v - min_v)


def fitness(chromosome: List[Dict[str, Any]], athlete: Dict[str, Any]) -> float:

    prices_ua = [
        t['price'] * CURRENCY_RATES.get(t.get('currency', 'UAH'), 1.0)
        for t in chromosome
    ]

    ratings = [t['coach_rating'] for t in chromosome]
    ages    = [t['avg_participant_age'] for t in chromosome]

    min_p, max_p = min(prices_ua), max(prices_ua)
    min_r, max_r = 1.0, 5.0
    athlete_age  = athlete['age']

    scores = []
    for idx, t in enumerate(chromosome):
        s_price = 1 - normalize(prices_ua[idx], min_p, max_p)
        s_rating = normalize(t['coach_rating'], min_r, max_r)
        diff = abs(t['avg_participant_age'] - athlete_age)
        s_age = max(0, 1 - diff / MAX_AGE_DIFF)
        if t['section'] in athlete['favorite_sections']:
            s_section = 1.0
        elif t['category'] in athlete['favorite_categories']:
            s_section = 0.5
        else:
            s_section = 0.0

        total = (
            WEIGHTS['price']   * s_price +
            WEIGHTS['rating']  * s_rating +
            WEIGHTS['age']     * s_age +
            WEIGHTS['section'] * s_section
        )
        scores.append(total)

    return sum(scores) / len(scores)


def initialize_population(trainings: List[Dict[str, Any]], K: int) -> List[List[Dict[str, Any]]]:
    pop = []
    while len(pop) < POPULATION_SIZE:
        pop.append(random.sample(trainings, K))
    return pop


def tournament_select(pop: List[List[Any]], athlete: Dict[str, Any]) -> List[List[Any]]:
    selected = []
    for _ in range(len(pop)):
        aspirants = random.sample(pop, TOURNAMENT_SIZE)
        best = max(aspirants, key=lambda c: fitness(c, athlete))
        selected.append(best)
    return selected


def crossover(parent1: List[Any], parent2: List[Any], K: int):
    if random.random() > CROSSOVER_RATE:
        return parent1.copy(), parent2.copy()

    cut = random.randint(1, K - 1)
    def make_child(a, b):
        child = a[:cut]
        for gene in b:
            if gene not in child:
                child.append(gene)
            if len(child) == K:
                break
        return child

    return make_child(parent1, parent2), make_child(parent2, parent1)


def mutate(chromosome: List[Any], pool: List[Any], K: int):
    if random.random() < MUTATION_RATE:
        i, j = random.sample(range(K), 2)
        chromosome[i], chromosome[j] = chromosome[j], chromosome[i]


def run_ga(trainings: List[Dict[str, Any]], athlete: Dict[str, Any], K: int = 5) -> List[Dict[str, Any]]:

    if len(trainings) <= K:
        return trainings.copy()

    pop         = initialize_population(trainings, K)
    best_solution = None
    best_score    = -math.inf

    for _ in range(GENERATIONS):
        pop.sort(key=lambda c: fitness(c, athlete), reverse=True)
        current, score = pop[0], fitness(pop[0], athlete)
        if score > best_score:
            best_score    = score
            best_solution = current

        new_pop = pop[:ELITE_COUNT]
        parents = tournament_select(pop, athlete)

        while len(new_pop) < POPULATION_SIZE:
            p1, p2   = random.sample(parents, 2)
            c1, c2   = crossover(p1, p2, K)
            mutate(c1, trainings, K)
            mutate(c2, trainings, K)
            new_pop.extend([c1, c2])

        pop = new_pop[:POPULATION_SIZE]

    return best_solution
