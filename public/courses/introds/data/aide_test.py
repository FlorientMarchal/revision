"""
Module contenant une fonction pour faciliter les tests

G. Richomme, 27 juin 2021
"""
def test(fonction_a_tester, liste_tests):
    """
    Permet de lancer des tests
    
    Données
    fonction_a_tester : nom d'une fontion
    liste_tests : listes de triplets
        - composante 1 : tuples des paramètres
        - composante 2 : valeur attendue
        - composante 3 : chaîne décrivant le test
    """
    nb_prob = 0
    for data, res_attendu, test in liste_tests:
        if type(data) == tuple:
            res_reel = fonction_a_tester(*data)
        else:
            res_reel = fonction_a_tester(data)
        if res_reel != res_attendu:
            print("------\nprobleme avec test : {}".format(test))
            print("Données = {}".format(data))
            print("Résultat attendu = {}".format(res_attendu))
            print("Résultat réel    = {}".format(res_reel))
            nb_prob += 1
    print("{} problème(s) sur {} tests".format(nb_prob, len(liste_tests)))
