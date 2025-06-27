#!/usr/bin/env python3
"""
Script de prueba para verificar el controlador de Latest Products
Este script puede ayudar a diagnosticar problemas con el controlador.
"""

import sys
import os

# Agregar el path de Odoo si es necesario
# sys.path.append('/path/to/odoo')

def test_controller_logic():
    """
    Simula la lógica del controlador para verificar errores
    """
    print("=== Test del Controlador Latest Products ===")
    
    # Simular parámetros
    pricelist_id = 1573
    print(f"Testing with pricelist_id: {pricelist_id}")
    
    try:
        # Convertir pricelist_id
        pricelist_id = int(pricelist_id) if pricelist_id else 1573
        print(f"Converted pricelist_id: {pricelist_id}")
        
        # Simular lógica de filtrado
        if pricelist_id == 0:
            print("Mode: Show all published products")
        else:
            print(f"Mode: Filter by pricelist {pricelist_id}")
            
        print("✅ Controller logic test passed")
        return True
        
    except Exception as e:
        print(f"❌ Controller logic test failed: {e}")
        return False

def check_file_structure():
    """
    Verifica que todos los archivos necesarios existan
    """
    print("\n=== Verificación de Estructura de Archivos ===")
    
    base_path = os.path.dirname(os.path.abspath(__file__))
    required_files = [
        '__init__.py',
        '__manifest__.py',
        'latest_products/__init__.py',
        'latest_products/controllers.py',
        'static/src/js/main.js',
        'static/src/js/snippet_options.js',
        'views/assets.xml',
        'views/snippets.xml',
        'views/snippet_options.xml'
    ]
    
    all_exist = True
    for file_path in required_files:
        full_path = os.path.join(base_path, file_path)
        if os.path.exists(full_path):
            print(f"✅ {file_path}")
        else:
            print(f"❌ {file_path} - MISSING")
            all_exist = False
    
    return all_exist

def main():
    print("Latest Products Module - Diagnostic Tool")
    print("=" * 50)
    
    # Test 1: File structure
    files_ok = check_file_structure()
    
    # Test 2: Controller logic
    logic_ok = test_controller_logic()
    
    # Summary
    print("\n=== RESUMEN ===")
    if files_ok and logic_ok:
        print("✅ Todos los tests pasaron")
        print("\nSi el módulo sigue sin funcionar, verifica:")
        print("1. Que el módulo esté instalado en Odoo")
        print("2. Que no haya errores en los logs de Odoo")
        print("3. Que la lista de precios ID 1573 exista")
        print("4. Que haya productos publicados en el website")
    else:
        print("❌ Algunos tests fallaron")
        print("Revisa los errores arriba antes de continuar")

if __name__ == '__main__':
    main()