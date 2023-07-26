import { Component, EventEmitter, Output } from '@angular/core';

import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import { FormBuilder } from '@angular/forms';
import { CategoryDataService } from '../services/category/category-data.service';

interface Category {
  id: number;
  name: string;
  childrens?: Category[] | undefined;
}

interface CategoryNode {
  id: number;
  name: string;
  nbKeywords: number;
  depth: number;
  ancestors?: Category[];
  childrens?: CategoryNode[];
}

interface FlatNodeCategory extends CategoryNode {
  level: number;
  expandable: boolean;
}


@Component({
  selector: 'app-select-category',
  templateUrl: './select-category.component.html',
  styleUrls: ['./select-category.component.css']
})
export class SelectCategoryComponent {
  @Output() changeProduct: EventEmitter<any> = new EventEmitter();
  
  private transformer = (node: CategoryNode, level: number) => {
    return {
      expandable: !!node.childrens && node.childrens.length > 0,
      level: level,
      name: node.name,
      id: node.id,
      nbKeywords: node.nbKeywords,
      depth: node.depth,
    };
  }

  buildTree(data: CategoryNode[]): CategoryNode[] {
    const tree: CategoryNode[] = [];

    function build(currentNode: CategoryNode, remainingNodes: CategoryNode[]) {
      // Base case: No more nodes to process
      if (remainingNodes.length === 0) {
        return;
      }
    
      // Find direct children of the current node
      const childrenNodes = remainingNodes.filter((node: CategoryNode) => node.ancestors ? node.ancestors[node.depth - 1].id === currentNode.id : false);
    
      for (let childNode of childrenNodes) {
        // Create a new node in the tree
        let newNode: CategoryNode = {
          id: childNode.id, 
          name: childNode.name,
          nbKeywords: childNode.nbKeywords, 
          depth: childNode.depth, 
          ancestors: [],
          childrens: [],
        };
    
        // Add the new node to the current node's children list
        if (currentNode.childrens) {
          currentNode.childrens.push(newNode);
        }
    
        // Recursively call the function for the child node and remaining nodes
        build(newNode, remainingNodes.filter((node) => node.id !== childNode.id));
      }
    }

    let treeRoot = {
      ...data[0],
      childrens: []
    };
    build(treeRoot, data.slice(1));
    tree.push(treeRoot)
    return tree;
  }

  treeControl = new FlatTreeControl<FlatNodeCategory>(
    node => node.level, node => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
      this.transformer,
      node => node.level,
      node => node.expandable,
      node => node.childrens,
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  dataRaw: any

  constructor(private formBuilder: FormBuilder, private categoryDataService: CategoryDataService) {
    this.categoryDataService.getCategories().subscribe((data) => {
      this.dataRaw = data;
      this.dataSource.data = this.buildTree(this.dataRaw);
      this.treeControl.expandAll()
    })
  }

  categoryForm = this.formBuilder.group({
    category: ""
  })

  hasChild = (_: number, node: FlatNodeCategory) => node.expandable;
}
