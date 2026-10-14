""" 
Exemple de manipulations de Python
Auteur : G. Richomme
"""
#-*- coding: utf-8 -*-

def saisie_liste( n ):
    """
    Saisie et retourne une liste de n valeurs
    
    Donnée : n est un entier
    Résultat (en retour de fonction) : une liste de n valeurs
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
    Retourne le plus petit indice de la valeur a_chercher dans lis.
    Retourne -1 en cas d'absence.
    
    Donnée : a_chercher est une valeur de type quelconque
    Donnée : lis est une liste de valeurs de types compatibles
            avec la valeur cherchée
    Résultat en retour de fonction : indice de a_chercher dans lis si val y
        est présent, -1 sinon
    """
    i = 0
    indice = -1
    while i < len(l) and indice == -1:
        if l[i] == val:
            indice = i
        else:
            i += 1
    return indice

# Programme local
if __name__ == "__main__":
    lis = saisie_liste( 4 )
    print("Voilà le tableau saisi : ", end = "")
    print(lis)

    print("Continuons")
    a_chercher = input("Donnez une valeur à chercher parmi les valeurs précédentes : ")
    ind = recherche( a_chercher, lis )
    if ind != -1:
        print("Votre valeur se trouve à l'indice {} dans le tableau créé".format(ind))
    else:
        print("Votre valeur n'est pas présente dans le tableau créé")


"""
Commande à tester en ligne de commande
help(recherche)
help("exemple_fonctions2")
"""
