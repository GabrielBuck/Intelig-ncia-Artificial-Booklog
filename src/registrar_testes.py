"""
Projeto: Sistema de Recomendação Personalizada de Livros para o Booklog
Disciplina: Inteligência Artificial - 7ºK - 2026/2 - Prof. Dr. Leandro Zerbinatti

Integrantes:
- Gabriel Nottoli Buck - RA 10425384 - 10425384@mackenzista.com.br
- Julia Andrade - RA 10427828 - 10427828@mackenzista.com.br
- João Vitor Rocha Miranda - RA 10427273 - 10427273@mackenzista.com.br
- Juan Nacif - RA 10428509 - 10428509@mackenzista.com.br

Descrição:
Executa os testes reproduzíveis do repositório acadêmico (Python e os testes
unitários originais copiados para snapshot/) e consolida o resultado em
results/test-results.json, junto ao registro da execução das 7 suítes
selecionadas no backend original (results/backend-selected-tests.json),
que exige o código privado e por isso é apenas anexado como evidência.

Uso: python src/registrar_testes.py

Histórico:
18/11/2026 - Grupo - criação do registro consolidado de testes da N2.
"""

import json
import re
import shutil
import subprocess
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RESULTS = ROOT / "results"


def run_python_tests() -> dict:
    proc = subprocess.run(
        [sys.executable, "-m", "unittest", "discover", "-s", "tests", "-v"],
        cwd=ROOT, capture_output=True, text=True, encoding="utf-8",
    )
    lines = proc.stderr.splitlines()
    tests = [{"title": m.group(1), "status": "passed" if m.group(2) == "ok" else m.group(2)}
             for m in (re.match(r"^(\w+ \([\w.]+\)) \.\.\. (\w+)", l) for l in lines) if m]
    total = re.search(r"Ran (\d+) test", proc.stderr)
    return {"command": "python -m unittest discover -s tests -v", "exit_code": proc.returncode,
            "tests": int(total.group(1)) if total else 0,
            "passed": sum(t["status"] == "passed" for t in tests), "details": tests}


def run_snapshot_tests() -> dict:
    npm = shutil.which("npm")
    out = RESULTS / ".jest-snapshot.json"
    proc = subprocess.run([npm, "test", "--", "--json", f"--outputFile={out}"],
                          cwd=ROOT / "snapshot", capture_output=True, text=True, encoding="utf-8")
    data = json.loads(out.read_text(encoding="utf-8"))
    out.unlink()
    suites = []
    for s in data["testResults"]:
        name = s["name"].replace("\\", "/")
        suites.append({"suite": "snapshot/" + name[name.index("src/"):], "status": s["status"],
                       "tests": len(s["assertionResults"]),
                       "passed": sum(a["status"] == "passed" for a in s["assertionResults"])})
    return {"command": "npm --prefix snapshot test", "exit_code": proc.returncode,
            "suites": suites, "tests": data["numTotalTests"], "passed": data["numPassedTests"],
            "failed": data["numFailedTests"]}


def main() -> None:
    backend = json.loads((RESULTS / "backend-selected-tests.json").read_text(encoding="utf-8"))
    report = {
        "executed_on": date.today().isoformat(),
        "python_academic_tests": run_python_tests(),
        "snapshot_original_unit_tests": run_snapshot_tests(),
        "backend_selected_suites": {
            "source": "results/backend-selected-tests.json",
            "description": backend["description"],
            "source_commit": backend["source_commit"],
            "executed_on": backend["executed_on"],
            "totals": backend["totals"],
            "scope_note": backend["scope_note"],
        },
    }
    (RESULTS / "test-results.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    p, s, b = report["python_academic_tests"], report["snapshot_original_unit_tests"], backend["totals"]
    print(f"Python acadêmico: {p['passed']}/{p['tests']} | Snapshot (testes originais copiados): {s['passed']}/{s['tests']} | "
          f"Backend, 7 suítes selecionadas (registro): {b['passed']}/{b['tests']}")
    if p["exit_code"] or s["exit_code"]:
        sys.exit(1)


if __name__ == "__main__":
    main()
