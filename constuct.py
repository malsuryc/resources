from datetime import datetime
import readline
#from fomatter import insert

class Resource:
    def __init__(self, main, title, url, description, tags, types, level, added, rating):
        self.main = main
        self.title = title
        self.url = url
        self.description = description
        self.tags = tags
        self.types = types
        self.level = level
        self.added = added
        self.rating = rating

    @property
    def level(self):
        return self._level
    @level.setter
    def level(self, value):
        try:
            value = int(value)
            if value not in list(range(4)):
                raise ValueError("Level must be 0 to 3")
            dict_level = {0: "all", 1: "beginner", 2: "intermediate", 3: "advanced"}
            self._level = dict_level[value]
        except (ValueError, TypeError):
            raise ValueError("Level must be 0 to 3")

    @property
    def rating(self):
        return self._rating
    @rating.setter
    def rating(self, value):
        try:
            value = int(value)
            if value < 1 or value > 5:
                raise ValueError("Rating must be between 1 and 5")
            self._rating = value
        except (ValueError, TypeError):
            raise ValueError("Rating must be between 1 and 5")

def get_content():
    resource = Resource(
        main=input("Main category: "),
        title=input("Title: "),
        url=input("URL: "),
        description=input("Description: "),
        tags=[tag.strip() for tag in input("Tags (comma-separated): ").split(",")],
        types=[type.strip() for type in input("Types (comma-separated): ").split(",")],
        level=input("Level(0: All, 1: Beginner, 2: Intermediate, 3: Advanced): "),
        added=datetime.now().strftime("%Y-%m-%d"),
        rating=input("Rating (1-5): ")
    )
    return resource

def to_yaml_string(resource):
    yaml_str = f"""'''
    main: {resource.main}
    title: {resource.title}
    url: {resource.url} 
    description: {resource.description}
    tags: {resource.tags}
    types: {resource.types}
    level: {resource.level}
    added: {resource.added}
    rating: {resource.rating}
'''
"""
    return yaml_str

def main():
    resource = get_content()
    yaml_str = to_yaml_string(resource)
    #insert("_data/resources.yml", yaml_str)
    print(yaml_str)

if __name__ == "__main__":
    main()