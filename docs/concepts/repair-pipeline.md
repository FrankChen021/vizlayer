# Repair Pipeline

Vizlayer starts with a small repair pipeline:

1. preprocess the input
2. detect the diagram kind
3. normalize known syntax hazards
4. validate the result
5. explain what changed

The initial implementation keeps this intentionally bounded so the engine stays explicit and testable.
