import sys
import json
import random  # valores aleatórios

def simular_consulta_acidentes(routeInstructions):
    resultado = []

    for trecho in routeInstructions:
        accidents = random.randint(0, 10) 
        
        resultado.append({
            "description": trecho["description"],
            "start": trecho["start"],
            "end": trecho["end"], 
            "distance": trecho["distance"], 
            "accidents": accidents  
        })

    return resultado

if __name__ == "__main__":
    routeInstructions = json.loads(sys.stdin.read())

    resultado = simular_consulta_acidentes(routeInstructions)

    print(json.dumps(resultado))
