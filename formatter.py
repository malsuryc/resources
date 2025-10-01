from constuct import *
def get_lines(yaml, mode = "r"):
    try:
        with open(yaml, mode) as file:
            line = file.readlines()
    except FileNotFoundError:
        print(f"Error: File {yaml} was not found.")
    return line

def write_lines(yaml, lines, mode = "w"):
    try:
        with open(yaml, mode) as file:
            file.writelines(lines)
    except FileNotFoundError:
        print(f"Error: File {yaml} was not found.")

def format():
    resource = get_lines("_data/resources.yml")
    is_start = True
    for i in range(len(resource)):
        line = resource[i]
        if line[0:4] and line[-5:-1] == "####":
            # add START nad END e.g. from ####C++#### to ####C++ START####
            if is_start:
                line = line[:-5] + " START####\n"
                is_start = False
            else:
                line = line[:-5] + " END####\n"
                is_start = True
            resource[i] = line
    write_lines("_data/resources.yml", resource)

def sort():
    pass

def insert(yaml_str):
    main = yaml_str.splitlines()[0].split(": ")[1].strip()
    query = get_lines(f"topics/{main}.md")[2].split(": ")[1].strip()
    resource = get_lines("_data/resources.yml")
    for i in range(len(resource)):
        line = resource[i]
        if line[0:4] == "####" and line[-10:-5] == "START" and query in line:
            resource.insert(i + 1, yaml_str)
            break
    write_lines("_data/resources.yml", resource)

def main():
    #format()
    resource = get_content()
    yaml_str = to_yaml_string(resource)
    print(yaml_str)
    insert(yaml_str)
if __name__ == "__main__":
    main()