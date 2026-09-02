import os

folders = [
    "dataset/train/labels",
    "dataset/valid/labels",
    "dataset/test/labels"
]

for folder in folders:

    for filename in os.listdir(folder):

        if filename.endswith(".txt"):

            path = os.path.join(folder, filename)

            with open(path, "r") as file:
                lines = file.readlines()

            new_lines = []

            for line in lines:

                parts = line.strip().split()

                if len(parts) >= 5:

                    parts[0] = "0"

                    new_lines.append(
                        " ".join(parts)
                    )

            with open(path, "w") as file:
                file.write("\n".join(new_lines))

print("All labels fixed!")