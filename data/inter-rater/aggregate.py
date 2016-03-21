import csv

people = ["Zheng", "Earl", "Chris"]
checkers = ["Flow", "TypeScript"]
projectIssues = set()

header = ["issue", "typechecker"] + people

def main():
    peopleIssues = {} 
    for person in people:
        peopleIssues[person] = LoadFilesForPerson(person)
    
    lines = []
    for issue in projectIssues:
        for typechecker in checkers:
            line = [issue, typechecker]
            for person in people:
                result = GetResultForIssueAndTypechecker(peopleIssues[person], issue, typechecker)
                line.append(result)
            lines.append(line)


    writer = csv.writer(open("aggregate.tsv", "w"), dialect="excel-tab")
    writer.writerow(header)
    writer.writerows(lines)

def GetResultForIssueAndTypechecker(issues, projectIssue, typeChecker):
    results = [issue[2] for issue in issues if issue[0] == projectIssue and issue[1] == typeChecker]
    if results:
        return results[0]
    # If we can't find the issue for the specified type checker then
    # look for the issue for ANY checker and assume they have the same answer
    results = [issue[2] for issue in issues if issue[0] == projectIssue]
    if results:
        return results[0]

    return "NotFound"


def LoadFilesForPerson(name):
    issues = LoadFile(name, name + "-IRA1.tsv")
    issues.extend(LoadFile(name, name + "-IRA2.tsv"))
    return issues


def LoadFile(name, filename):
    issues = []
    for line in csv.reader(open(filename), dialect="excel-tab"):
        projectIssue, typechecker, detectable = line[0] + "#" + line[1], line[3], line[4]
        if projectIssue == "Project#Issue":
            continue
        issues.append( (projectIssue, typechecker, detectable) )
        projectIssues.add(projectIssue)
    return issues

        
if __name__ == "__main__":
    main()
