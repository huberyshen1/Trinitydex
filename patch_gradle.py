import os

# 1. Upgrade Gradle wrapper to 8.7
properties_path = os.path.join("android", "gradle", "wrapper", "gradle-wrapper.properties")
if os.path.exists(properties_path):
    with open(properties_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    new_lines = []
    for line in lines:
        if line.startswith("distributionUrl="):
            # Replace gradle-8.2.1-all.zip or similar with gradle-8.7-all.zip
            line = "distributionUrl=https\\://services.gradle.org/distributions/gradle-8.7-all.zip\n"
            print(f"Updated distributionUrl to gradle-8.7-all.zip")
        new_lines.append(line)
        
    with open(properties_path, "w", encoding="utf-8") as f:
        f.writelines(new_lines)
    print("Successfully upgraded Gradle wrapper to 8.7!")
else:
    print(f"Error: {properties_path} not found!")
    exit(1)

# Note: We do NOT patch android/build.gradle with BouncyCastle force override anymore,
# because Gradle 8.7 natively supports Java 21 classes (major version 65) without crashing.
