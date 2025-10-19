#print('Mi', 'nombre', 'es', 'Nicolas', sep='#')

# num = 968.19893842
# print('%.2f' % num)

# La salida del siguiente programa es: 15
'''
variable = [1,2,3,4,5]
for i in range(len(variable)):
    variable[i] += 1
print(variable)'''

'''
valores = []
for numero in range(200, 211):
    numero_texto = str(numero)
    if (int(numero_texto[0])%2==0) and (int(numero_texto[1])%2==0) and (int(numero_texto[2])%2==0):
        valores.append(numero_texto)
print(", ".join(valores))'''

'''a)
numeros=[]
for numero in range(0, 51):
    if (numero % 7 == 0) and (numero % 5 != 0):
        numeros.append(str(numero))
print(", ".join(numeros))'''

'''b) mal
numeros=[]
for numero in range(0, 51):
    if (numero / 7 > 0) and (numero % 5 != 0):
        numeros.append(str(numero))
print(", ".join(numeros))'''
'''
numeros=[]
for numero in range(0, 51):
    if (numero % 7 == 0) and (numero * 5 == 0):
        numeros.append(str(numero))
print(", ".join(numeros))'''

'''
n=8
diccionario = dict()
for i in range(1, n + 1):
    diccionario[i] = i * i
print(diccionario)'''

'''
class NaveEspacial:
    # Atributos de clase
    max_deposito = 1000
    parsec = 100
    # Método de inicialización
    def __init__(self, co, comb):
        self.estado_alertas = False
        # Atributos de instancia
        self.color=co
        if (comb > self.max_deposito):
            self.combustible = self.max_deposito
        else:
            self.combustible = comb
    def establecerEstadoAlertas (self, habilitar):
        self.estado_alertas = habilitar
    def obtenerCombustible(self):
        return self.combustible
    def agregarCombustible (self, comb):
        if self.combustible + comb > self.max_deposito:
            if self.estado_alertas:
                print('¡De los ' + str(comb) + ' litros, solo se pudieron cargar '
                    + str(self.max_deposito - self.combustible) + ' litros!')
                self.combustible = self.max_deposito
        else:
            if self.estado_alertas:
                print('¡Se cargaron ' + str(comb) + ' litros!')
            self.combustible += comb
'''        
'''
nave_espacial1 = NaveEspacial('R', 500)
print('Combustible de Nave 1: ' + str(nave_espacial1.obtenerCombustible()))
nave_espacial1.establecerEstadoAlertas(True)
nave_espacial1.agregarCombustible(700)
print('Combustible de Nave 1: ' + str(nave_espacial1.obtenerCombustible()))
nave_espacial2 = NaveEspacial('A', 0)
print('Combustible de Nave 2: ' + str(nave_espacial2.obtenerCombustible()))
nave_espacial2.establecerEstadoAlertas
nave_espacial2.agregarCombustible(200)
print('Combustible de Nave 2: ' + str(nave_espacial2.obtenerCombustible()))
'''
'''
nave_espacial1 = NaveEspacial()
print('Combustible de Nave 1: ' + str(nave_espacial1.obtenerCombustible()))
nave_espacial1.establecerEstadoAlertas(True)
nave_espacial1.agregarCombustible(700)
print('Combustible de Nave 1: ' + str(nave_espacial1.obtenerCombustible()))'''

'''
nave_espacial1 = NaveEspacial
print('Combustible de Nave 1: ' + str(nave_espacial1.obtenerCombustible()))
nave_espacial1.establecerEstadoAlertas(True)
nave_espacial1.agregarCombustible(700)
print('Combustible de Nave 1: ' + str(nave_espacial1.obtenerCombustible()))'''

'''nave_espacial1 = NaveEspacial('R', 500)
nave_espacial1.establecerEstadoAlertas(True)
nave_espacial1.combustible += 700
print(nave_espacial1.obtenerCombustible())
'''
'''
nave_espacial1 = NaveEspacial('R', 500)
nave_espacial2 = NaveEspacial('R', 500)
print('Nave 1 = Nave 2: ' + str(nave_espacial1 == nave_espacial2))
'''
'''
class Pelota:
    def _init__(self):
        self.estado = 'FRENADA'
    def obtenerEstado(self):
        return self.estado
    def rodar (self):
        print('Rodando...')
        self.estado = 'RODANDO'
    def frenar(self):
        print('Frenando...')
        self.estado = 'FRENADA'
    def imprimirEstado(self):
        print('Estado: ' + self.estado)

'''
'''pelota = Pelota()
pelota.imprimirEstado
pelota.rodar()
print(pelota.obtenerEstado())
pelota.frenar()
pelota.imprimirEstado'''
'''
pelota = new Pelota()
pelota.imprimir_estado()
pelota.rodar()
print(pelota.obtenerEstado())
pelota.frenar()
pelota.imprimir_estado()'''

'''class PelotaConNombre:
    def __init__(self, nombre):
        self.nombre = nombre
    def __establecerEstadoInicial (self):
        self._establecerEstado('FRENADA')
    def _establecerEstado (self, estado):
        self.estado = estado
    def establecerNombre(self, nombre):
        self.nombre = nombre
    def obtenerEstado(self):
        return self.estado
    def obtenerNombre(self):
        return self.nombre
    def rodar(self):
        print('Rodando...')
        self._establecerEstado ('RODANDO')
    def frenar(self):
        print('Frenando...')
        self._establecerEstado ('FRENADA')
    def imprimirEstado (self):
        print('Estado de ' + self.nombre + ': ' + self.estado)
'''
'''pelota1 = PelotaConNombre('Pelota 1')
pelota1.__establecerEstadoInicial()
pelota1.imprimirEstado()'''

'''pelota1 = PelotaConNombre('Pelota 1')
pelota2 = PelotaConNombre('Pelota 2')
pelota1.establecerNombre('Pelota 2')
pelota2.establecerNombre('Pelota 1')
print(pelota1.obtenerNombre())
print(pelota2.obtenerNombre())'''

arreglo = []
arreglo.append(0)
arreglo.append('a')
print(arreglo)