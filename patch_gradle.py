import os

# 1. Upgrade Gradle wrapper to 8.9
properties_path = os.path.join("android", "gradle", "wrapper", "gradle-wrapper.properties")
if os.path.exists(properties_path):
    with open(properties_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    new_lines = []
    for line in lines:
        if line.startswith("distributionUrl="):
            # Replace gradle-8.2.1-all.zip or similar with gradle-8.9-all.zip
            line = "distributionUrl=https\\://services.gradle.org/distributions/gradle-8.9-all.zip\n"
            print(f"Updated distributionUrl to gradle-8.9-all.zip")
        new_lines.append(line)
        
    with open(properties_path, "w", encoding="utf-8") as f:
        f.writelines(new_lines)
    print("Successfully upgraded Gradle wrapper to 8.9!")
else:
    print(f"Error: {properties_path} not found!")
    exit(1)

# 2. Patch android/variables.gradle to use compileSdkVersion = 35 and targetSdkVersion = 35
# to support Build.VERSION_CODES.VANILLA_ICE_CREAM used by newer `@capacitor/android` versions.
variables_path = os.path.join("android", "variables.gradle")
if os.path.exists(variables_path):
    with open(variables_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    import re
    new_content = re.sub(r"compileSdkVersion\s*=\s*\d+", "compileSdkVersion = 35", content)
    new_content = re.sub(r"targetSdkVersion\s*=\s*\d+", "targetSdkVersion = 35", new_content)
    
    with open(variables_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Successfully updated compileSdkVersion and targetSdkVersion to 35 in variables.gradle!")
else:
    print(f"Warning: {variables_path} not found!")

# 3. Patch android/build.gradle to force newer kotlin-stdlib versions
# to prevent duplicate class errors (e.g. kotlin-stdlib-jdk8 vs kotlin-stdlib)
build_gradle_path = os.path.join("android", "build.gradle")
if os.path.exists(build_gradle_path):
    with open(build_gradle_path, "a", encoding="utf-8") as f:
        f.write("\n\n// Resolve duplicate Kotlin classes issue\n")
        f.write("subprojects {\n")
        f.write("    configurations.all {\n")
        f.write("        resolutionStrategy {\n")
        f.write("            force 'org.jetbrains.kotlin:kotlin-stdlib:1.8.22'\n")
        f.write("            force 'org.jetbrains.kotlin:kotlin-stdlib-jdk7:1.8.22'\n")
        f.write("            force 'org.jetbrains.kotlin:kotlin-stdlib-jdk8:1.8.22'\n")
        f.write("        }\n")
        f.write("    }\n")
        f.write("}\n")
    print("Successfully appended Kotlin stdlib resolution strategy to android/build.gradle!")
else:
    print(f"Warning: {build_gradle_path} not found!")

# Note: We do NOT patch android/build.gradle with BouncyCastle force override anymore,
# because Gradle 8.9 natively supports Java 21 classes (major version 65) without crashing.

