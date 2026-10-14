""" 
Exemple de manipulations de Python
Auteur : G. Richomme
"""
#-*- coding: utf-8 -*-

def saisie_liste( n ):
    """
    Donnée : n est un entier
    Résultat en retour de fonction : une liste de n valeurs
    Remarque : si n <= 0, la liste vide est retournée
    """
    print("Donnez", n, "valeurs")
    l = []
    for i in range(0, n, 1):
        val = input(str((i+1))+"ème valeur : ")
        l.append( val )
    return l

def recherche( val, l):
    """
    Donnée : val est une valeur
    Donnée : l est une liste de valeurs
    Résultat en retour de fonction : indice de val dans l si val y
        est présent, -1 sinon
    """
    i = 0
    indice = -1
    while i < len(l) and indice == -1:
        if l[i] == a_chercher:
            indice = i
        else:
            i += 1
    return indice

# Programme principal
lis = saisie_liste( 4 )
print("Voilà le tableau saisi : ", end = "")
print(lis)

print("Continuons")
a_chercher = input("Donnez une valeur à chercher parmi les valeurs précédentes : ")
ind = recherche( a_chercher, lis )
if ind != -1:
    print("Votre valeur se trouve à l'indice", ind, "dans le tableau créé")
else:
    print("Votre valeur n'est pas présente dans le tableau créé")
